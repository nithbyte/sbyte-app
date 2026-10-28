import { ProductSummary, ProductCategory, UnitOfMeasure } from '@sbyte/shared-types';

describe('Customer Mobile Cart & Checkout Logic', () => {
  const sampleProducts: ProductSummary[] = [
    {
      id: 'prod-001',
      sku: 'GRO-PON-001',
      name: 'Ponni Boiled Rice',
      description: 'Clean aged grain',
      category: ProductCategory.GROCERIES_STAPLES,
      brand: 'S Byte Select',
      imageUrl: 'https://images.unsplash.com/photo-1',
      unit: UnitOfMeasure.KILOGRAM,
      packageSize: '5 kg',
      basePrice: 340,
      discountPrice: 315,
      isVeg: true,
    },
    {
      id: 'prod-004',
      sku: 'SNK-HAL-001',
      name: 'Tirunelveli Wheat Halwa',
      description: 'Original wheat milk halwa',
      category: ProductCategory.SNACKS_MUNCHIES,
      brand: 'Nellai Traditional',
      imageUrl: 'https://images.unsplash.com/photo-2',
      unit: UnitOfMeasure.GRAM,
      packageSize: '400 g',
      basePrice: 220,
      discountPrice: 199,
      isVeg: true,
    },
    {
      id: 'prod-003',
      sku: 'VEG-TOM-001',
      name: 'Country Tomatoes',
      description: 'Farm-fresh',
      category: ProductCategory.FRUITS_VEGETABLES,
      brand: 'Nellai Farms',
      imageUrl: 'https://images.unsplash.com/photo-3',
      unit: UnitOfMeasure.KILOGRAM,
      packageSize: '1 kg',
      basePrice: 42,
      discountPrice: 34,
      isVeg: true,
    },
  ];

  const calculateCart = (
    items: { product: ProductSummary; quantity: number }[],
    couponCode: string | null = null,
  ) => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => {
      const price = i.product.discountPrice ?? i.product.basePrice;
      return sum + price * i.quantity;
    }, 0);

    const freeDeliveryThreshold = 299;
    const baseDeliveryFee = 25;
    const handlingFee = totalItems > 0 ? 5 : 0;
    const deliveryFee = totalItems > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee) : 0;
    const freeDeliveryNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

    let discount = 0;
    if (couponCode === 'SBYTE100' && subtotal >= 499) {
      discount = 100;
    } else if (couponCode === 'SUPERFAST15' && subtotal >= 199) {
      discount = Math.min(75, Math.round(subtotal * 0.15));
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee + handlingFee - discount);

    return {
      totalItems,
      subtotal,
      deliveryFee,
      handlingFee,
      discount,
      totalAmount,
      freeDeliveryNeeded,
    };
  };

  it('should calculate accurate subtotal and apply delivery fee when below ₹299 threshold', () => {
    // 2 kg tomatoes = 2 * 34 = ₹68
    const items = [{ product: sampleProducts[2], quantity: 2 }];
    const res = calculateCart(items);

    expect(res.totalItems).toBe(2);
    expect(res.subtotal).toBe(68);
    expect(res.deliveryFee).toBe(25);
    expect(res.handlingFee).toBe(5);
    expect(res.freeDeliveryNeeded).toBe(231); // 299 - 68
    expect(res.totalAmount).toBe(98); // 68 + 25 + 5
  });

  it('should unlock FREE delivery when cart value is ₹299 or above', () => {
    // 1 Ponni Rice (315)
    const items = [{ product: sampleProducts[0], quantity: 1 }];
    const res = calculateCart(items);

    expect(res.subtotal).toBe(315);
    expect(res.deliveryFee).toBe(0);
    expect(res.freeDeliveryNeeded).toBe(0);
    expect(res.handlingFee).toBe(5);
    expect(res.totalAmount).toBe(320); // 315 + 0 + 5
  });

  it('should apply SBYTE100 flat ₹100 discount when cart exceeds ₹499', () => {
    // 1 Rice (315) + 1 Halwa (199) = ₹514
    const items = [
      { product: sampleProducts[0], quantity: 1 },
      { product: sampleProducts[1], quantity: 1 },
    ];
    const res = calculateCart(items, 'SBYTE100');

    expect(res.subtotal).toBe(514);
    expect(res.discount).toBe(100);
    expect(res.deliveryFee).toBe(0);
    expect(res.totalAmount).toBe(419); // 514 + 0 + 5 - 100
  });

  it('should reject SBYTE100 coupon when cart subtotal is under ₹499', () => {
    // 1 Halwa (199)
    const items = [{ product: sampleProducts[1], quantity: 1 }];
    const res = calculateCart(items, 'SBYTE100');

    expect(res.subtotal).toBe(199);
    expect(res.discount).toBe(0);
  });

  it('should apply SUPERFAST15 (15% off) up to maximum cap of ₹75', () => {
    // 2 Rice (315 * 2 = 630) -> 15% is 94.5, capped at 75
    const items = [{ product: sampleProducts[0], quantity: 2 }];
    const res = calculateCart(items, 'SUPERFAST15');

    expect(res.subtotal).toBe(630);
    expect(res.discount).toBe(75);
    expect(res.totalAmount).toBe(560); // 630 + 0 + 5 - 75
  });

  describe('Single Fulfillment Store Constraint', () => {
    it('should detect store conflict when cart has items from another store', () => {
      const cartStoreId: string = 'store-palayamkottai';
      const requestedStoreId: string = 'store-vannarpettai';
      const cartItemCount = 2;

      const hasConflict = cartStoreId && cartStoreId !== requestedStoreId && cartItemCount > 0;
      expect(hasConflict).toBe(true);
    });

    it('should not conflict when adding item from the same fulfillment store', () => {
      const cartStoreId: string = 'store-palayamkottai';
      const requestedStoreId: string = 'store-palayamkottai';
      const cartItemCount = 2;

      const hasConflict = cartStoreId && cartStoreId !== requestedStoreId && cartItemCount > 0;
      expect(hasConflict).toBe(false);
    });
  });
});
