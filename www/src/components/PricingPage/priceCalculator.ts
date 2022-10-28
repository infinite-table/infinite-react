export const BASE_PRICE = Number(
  process.env.NEXT_PUBLIC_LICENSE_PRICE || '395',
);

export const LICENSE_MAX = 19;
export const discounts = [
  {
    devCount: 3,
    discountValue: 5,
    perDeveloperPrice: 0,
  },
  { devCount: 5, discountValue: 10, perDeveloperPrice: 0 },
  { devCount: 10, discountValue: 15, perDeveloperPrice: 0 },
];

discounts.forEach((d) => {
  d.perDeveloperPrice = Math.floor(BASE_PRICE * (1 - d.discountValue / 100));
});

export function getPriceForCount(count: number): number {
  return getPricePointInfo(count).totalPrice;
}

type PricePointInfo = {
  totalPrice: number;
  perDeveloperPrice: number;
  developerCount: number;
};
export function getPricePointInfo(count: number): PricePointInfo {
  const firstDiscount = discounts[0];

  if (count < firstDiscount.devCount) {
    return {
      totalPrice: BASE_PRICE * count,
      perDeveloperPrice: BASE_PRICE,
      developerCount: count,
    };
  }
  const len = discounts.length;

  for (let i = len - 1; i >= 0; i--) {
    const { devCount, perDeveloperPrice } = discounts[i];

    if (count >= devCount) {
      return {
        totalPrice: count * perDeveloperPrice,
        perDeveloperPrice,
        developerCount: count,
      };
    }
  }

  return {
    totalPrice: BASE_PRICE * count,
    perDeveloperPrice: BASE_PRICE,
    developerCount: count,
  };
}

export function formatCurrency(price: number) {
  return (
    '$ ' +
    new Intl.NumberFormat('en-US', {
      // style: 'none',
      currency: 'USD',
    }).format(price)
  );
}

export function getFormattedPricePerDeveloper(count: number) {
  const price = getPricePointInfo(count).perDeveloperPrice;

  return '$ ' + price;
}
