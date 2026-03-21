export interface CashFlowInputs {
  price: number;
  monthlySales: number;
  fixedCosts: number;
  variableCosts: number;
  marketingBudget: number;
  taxPercent: number;
}

export const calculateCashFlow = (inputs: CashFlowInputs) => {
  const monthlyRevenue = inputs.price * inputs.monthlySales;
  const totalVariableCosts = inputs.variableCosts * inputs.monthlySales;
  const totalExpensesBeforeTax =
    inputs.fixedCosts + totalVariableCosts + inputs.marketingBudget;
  const grossProfit = monthlyRevenue - totalVariableCosts;

  const netProfitBeforeTax = monthlyRevenue - totalExpensesBeforeTax;
  const taxAmount =
    netProfitBeforeTax > 0 ? (netProfitBeforeTax * inputs.taxPercent) / 100 : 0;
  const netProfit = netProfitBeforeTax - taxAmount;

  const contributionMargin = inputs.price - inputs.variableCosts;
  const breakEvenPoint =
    contributionMargin > 0
      ? Math.ceil(
          (inputs.fixedCosts + inputs.marketingBudget) / contributionMargin,
        )
      : 0;

  // Generate 12 months projection
  const yearlyProjection = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    revenue: monthlyRevenue,
    profit: netProfit,
    expenses: totalExpensesBeforeTax + taxAmount,
  }));

  return {
    monthlyRevenue,
    totalExpenses: totalExpensesBeforeTax + taxAmount,
    grossProfit,
    netProfit,
    breakEvenPoint,
    yearlyProjection,
  };
};
