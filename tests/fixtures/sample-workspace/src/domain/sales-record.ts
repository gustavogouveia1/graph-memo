export interface SaleRecord {
  sellerId: string;
  grossAmount: number;
  region: "north" | "south";
}

export const sampleSales: SaleRecord[] = [
  {
    sellerId: "seller-1",
    grossAmount: 10_000,
    region: "north"
  },
  {
    sellerId: "seller-2",
    grossAmount: 4_500,
    region: "south"
  }
];
