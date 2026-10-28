import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ServiceabilityResult } from '../api/client';
import { StoreDto } from '@sbyte/shared-types';

export interface DeliveryAddress {
  id: string;
  tag: 'HOME' | 'WORK' | 'OTHER';
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  locality: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

interface LocationContextType {
  currentStore: StoreDto | null;
  availableStores: StoreDto[];
  currentAddress: DeliveryAddress;
  savedAddresses: DeliveryAddress[];
  serviceability: ServiceabilityResult;
  isResolving: boolean;
  deliveryInstructions: string;
  setDeliveryInstructions: (instructions: string) => void;
  selectStoreByCode: (code: string) => void;
  selectAddress: (address: DeliveryAddress) => Promise<void>;
  addNewAddress: (address: Omit<DeliveryAddress, 'id'>) => Promise<DeliveryAddress>;
  checkServiceabilityForCoords: (lat: number, lng: number) => Promise<ServiceabilityResult>;
  refreshStores: () => Promise<void>;
}

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-default-1',
    tag: 'HOME',
    recipientName: 'Karthik Raja',
    phone: '+91 98765 43210',
    streetAddress: 'Plot 45, 3rd Cross Street, Rahmath Nagar',
    landmark: 'Near Kamarajar Statue',
    locality: 'Palayamkottai',
    city: 'Tirunelveli',
    postalCode: '627002',
    latitude: 8.7185,
    longitude: 77.7495,
    deliveryInstructions: 'Leave package with security / Call upon arrival',
    isDefault: true,
  },
  {
    id: 'addr-default-2',
    tag: 'WORK',
    recipientName: 'Karthik Raja',
    phone: '+91 98765 43210',
    streetAddress: '12-A North Bypass Road, Opp. St. Xaviers College',
    landmark: 'Tech Hub Floor 2',
    locality: 'Vannarpettai',
    city: 'Tirunelveli',
    postalCode: '627003',
    latitude: 8.7282,
    longitude: 77.7285,
    deliveryInstructions: 'Ring doorbell twice',
    isDefault: false,
  },
  {
    id: 'addr-default-3',
    tag: 'OTHER',
    recipientName: 'Karthik Raja (Parents)',
    phone: '+91 98765 43210',
    streetAddress: '54 East Car Street, Near Nellaiyappar Temple',
    landmark: 'Opp. Big Gopuram',
    locality: 'Tirunelveli Town',
    city: 'Tirunelveli',
    postalCode: '627006',
    latitude: 8.7335,
    longitude: 77.6985,
    deliveryInstructions: 'Elderly at home - please be gentle',
    isDefault: false,
  },
];

const ADDRESS_STORAGE_KEY = '@sbyte_saved_addresses';
const SELECTED_ADDR_KEY = '@sbyte_selected_address';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableStores, setAvailableStores] = useState<StoreDto[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreDto | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress>(DEFAULT_ADDRESSES[0]);
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    DEFAULT_ADDRESSES[0].deliveryInstructions || '',
  );
  const [serviceability, setServiceability] = useState<ServiceabilityResult>({
    serviceable: true,
    storeId: 'store-palayamkottai',
    storeName: 'S BYTE Palayamkottai Flagship',
    storeCode: 'SBYTE_PLM',
    distanceKm: 0.8,
    deliveryEstimateMin: 12,
    message: 'Express 12-Min Delivery from Palayamkottai Flagship',
  });
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    initLocationData();
  }, []);

  const initLocationData = async () => {
    setIsResolving(true);
    try {
      // 1. Fetch live stores
      const stores = await api.getStores();
      setAvailableStores(stores);

      // 2. Load stored addresses
      const storedAddrs = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);
      let addrs = DEFAULT_ADDRESSES;
      if (storedAddrs) {
        try {
          addrs = JSON.parse(storedAddrs);
          setSavedAddresses(addrs);
        } catch {}
      }

      // 3. Load selected address
      const storedSelected = await AsyncStorage.getItem(SELECTED_ADDR_KEY);
      let selected = addrs[0];
      if (storedSelected) {
        try {
          selected = JSON.parse(storedSelected);
        } catch {}
      }
      setCurrentAddress(selected);
      setDeliveryInstructions(selected.deliveryInstructions || '');

      // 4. Resolve serviceability for selected address
      await resolveForAddress(selected, stores);
    } catch (e) {
      console.warn('Location initialization error', e);
    } finally {
      setIsResolving(false);
    }
  };

  const resolveForAddress = async (addr: DeliveryAddress, storesList?: StoreDto[]) => {
    setIsResolving(true);
    try {
      const result = await api.resolveServiceability(addr.latitude, addr.longitude);
      setServiceability(result);

      const stores = storesList || availableStores;
      if (result.serviceable && result.storeId) {
        const matched = stores.find((s) => s.id === result.storeId || s.code === result.storeCode);
        if (matched) {
          setCurrentStore(matched);
        } else if (stores.length > 0) {
          setCurrentStore(stores[0]);
        }
      }
    } catch (e) {
      console.warn('Failed resolving serviceability', e);
    } finally {
      setIsResolving(false);
    }
  };

  const selectAddress = async (addr: DeliveryAddress) => {
    setCurrentAddress(addr);
    setDeliveryInstructions(addr.deliveryInstructions || '');
    await AsyncStorage.setItem(SELECTED_ADDR_KEY, JSON.stringify(addr));
    await resolveForAddress(addr);
  };

  const addNewAddress = async (newAddrData: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress> => {
    const newAddress: DeliveryAddress = {
      ...newAddrData,
      id: `addr-${Date.now()}`,
    };

    const updated = [newAddress, ...savedAddresses];
    setSavedAddresses(updated);
    await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));

    // Try saving to backend if user is authenticated
    try {
      await api.addAddress({
        tag: newAddress.tag,
        recipientName: newAddress.recipientName,
        phone: newAddress.phone,
        streetAddress: newAddress.streetAddress,
        landmark: newAddress.landmark,
        locality: newAddress.locality,
        city: newAddress.city,
        postalCode: newAddress.postalCode,
        latitude: newAddress.latitude,
        longitude: newAddress.longitude,
      });
    } catch {
      // offline fallback is already saved to local storage
    }

    await selectAddress(newAddress);
    return newAddress;
  };

  const selectStoreByCode = (code: string) => {
    const store = availableStores.find((s) => s.code === code);
    if (store) {
      setCurrentStore(store);
      setServiceability({
        serviceable: true,
        storeId: store.id,
        storeName: store.name,
        storeCode: store.code,
        distanceKm: 1.2,
        deliveryEstimateMin: store.deliveryEstimateMin,
        message: `Express ${store.deliveryEstimateMin}-Min Delivery from ${store.name}`,
      });
    }
  };

  const checkCoordinates = async (lat: number, lng: number): Promise<ServiceabilityResult> => {
    return api.resolveServiceability(lat, lng);
  };

  const refreshStores = async () => {
    const stores = await api.getStores();
    setAvailableStores(stores);
  };

  return (
    <LocationContext.Provider
      value={{
        currentStore,
        availableStores,
        currentAddress,
        savedAddresses,
        serviceability,
        isResolving,
        deliveryInstructions,
        setDeliveryInstructions,
        selectStoreByCode,
        selectAddress,
        addNewAddress,
        checkServiceabilityForCoords: checkCoordinates,
        refreshStores,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
