import { calculateCommission } from "../domain/commission-policy";
import { sampleSales } from "../domain/sales-record";

export interface CommissionReport {
  totalCommission: number;
  entries: Array<{
    sellerId: string;
    commissionAmount: number;
  }>;
}

export function buildMonthlyCommissionReport(): CommissionReport {
  const entries = sampleSales.map((sale) => {
    const breakdown = calculateCommission(sale);

    return {
      sellerId: breakdown.sellerId,
      commissionAmount: breakdown.commissionAmount
    };
  });

  const totalCommission = entries.reduce((sum, entry) => sum + entry.commissionAmount, 0);

  return {
    totalCommission,
    entries
  };
}
