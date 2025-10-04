const USD_TO_INR = 83.5;

export const formatCurrency = (amount: number): string => {
  const inr = amount * USD_TO_INR;
  return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
};

export const usdToInr = (usd: number): number => {
  return usd * USD_TO_INR;
};
