describe('Customer Mobile Serviceability & Coverage', () => {
  const stores = [
    {
      id: 'store-palayamkottai',
      name: 'Palayamkottai Flagship',
      lat: 8.718,
      lng: 77.749,
      radiusKm: 6.5,
    },
    {
      id: 'store-vannarpettai',
      name: 'Vannarpettai Branch',
      lat: 8.728,
      lng: 77.728,
      radiusKm: 5.0,
    },
    {
      id: 'store-town',
      name: 'Tirunelveli Town Branch',
      lat: 8.733,
      lng: 77.698,
      radiusKm: 5.5,
    },
  ];

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

  const resolveStore = (userLat: number, userLng: number) => {
    let closestStore: (typeof stores)[0] | null = null;
    let shortestDist = Infinity;

    for (const s of stores) {
      const dist = calculateDistanceKm(userLat, userLng, s.lat, s.lng);
      if (dist <= s.radiusKm && dist < shortestDist) {
        shortestDist = dist;
        closestStore = s;
      }
    }

    if (closestStore) {
      return {
        serviceable: true,
        store: closestStore,
        distanceKm: shortestDist,
      };
    }

    return {
      serviceable: false,
      store: null,
      distanceKm: null,
    };
  };

  it('should resolve Palayamkottai Flagship for Rahmath Nagar delivery address (0.5 km)', () => {
    const rahmathNagar = { lat: 8.719, lng: 77.752 };
    const result = resolveStore(rahmathNagar.lat, rahmathNagar.lng);

    expect(result.serviceable).toBe(true);
    expect(result.store?.id).toBe('store-palayamkottai');
    expect(result.distanceKm).toBeLessThan(1.0);
  });

  it('should resolve Vannarpettai Branch for North Bypass Road (0.4 km)', () => {
    const vannarpettai = { lat: 8.729, lng: 77.729 };
    const result = resolveStore(vannarpettai.lat, vannarpettai.lng);

    expect(result.serviceable).toBe(true);
    expect(result.store?.id).toBe('store-vannarpettai');
    expect(result.distanceKm).toBeLessThan(1.0);
  });

  it('should mark Alangulam (18 km away) as unserviceable outside coverage', () => {
    const alangulam = { lat: 8.87, lng: 77.49 };
    const result = resolveStore(alangulam.lat, alangulam.lng);

    expect(result.serviceable).toBe(false);
    expect(result.store).toBeNull();
  });

  it('should mark Tenkasi (45 km away) as unserviceable outside coverage', () => {
    const tenkasi = { lat: 8.96, lng: 77.31 };
    const result = resolveStore(tenkasi.lat, tenkasi.lng);

    expect(result.serviceable).toBe(false);
    expect(result.store).toBeNull();
  });
});
