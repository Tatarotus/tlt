// Simple test file to demonstrate mutation testing
export function add(a: number, b: number): number {
  return a + b;
}

export function isEven(num: number): boolean {
  return num % 2 === 0;
}

export function calculateDiscount(price: number, discount: number): number {
  if (discount > 0) {
    return price - (price * discount / 100);
  }
  return price;
}

// Add a function to test edge cases
export function isPositive(num: number): boolean {
  return num > 0;
}