import { buildMonthlyCommissionReport } from "./application/commission-service";

export function runCommissionPreview(): string {
  const report = buildMonthlyCommissionReport();
  return `Total de comissao: ${report.totalCommission}`;
}
