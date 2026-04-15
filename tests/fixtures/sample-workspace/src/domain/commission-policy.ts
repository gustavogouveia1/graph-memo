import { roundCurrency } from "../utils/rounding";

import type { SaleRecord } from "./sales-record";

export interface CommissionBreakdown {
  sellerId: string;
  grossAmount: number;
  baseRate: number;
  bonusRate: number;
  commissionAmount: number;
}

export function calculateCommission(sale: SaleRecord): CommissionBreakdown {
  const baseRate = sale.region === "north" ? 0.07 : 0.05;
  const bonusRate = sale.grossAmount >= 8_000 ? 0.015 : 0;
  const rawCommission = sale.grossAmount * (baseRate + bonusRate);

  return {
    sellerId: sale.sellerId,
    grossAmount: sale.grossAmount,
    baseRate,
    bonusRate,
    commissionAmount: roundCurrency(rawCommission)
  };
}
