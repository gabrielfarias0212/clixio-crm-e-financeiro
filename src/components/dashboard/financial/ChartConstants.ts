
// Modern color palette for financial charts
export const CHART_COLORS = {
  income: "#8B5CF6",  // purple
  expenses: "#F43F5E", // rose
  graph: {
    gridLines: "#e5e7eb",
    axisText: "#6b7280",
  },
  background: {
    light: "rgba(255, 255, 255, 0.5)",
    dark: "rgba(30, 41, 59, 0.5)"
  }
};

// Utility function for formatting currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
