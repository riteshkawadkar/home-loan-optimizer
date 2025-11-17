export interface LoanInfo {
  startDate: string;
  originalAmount: number;
  originalTenure: number;
  currentEMI: number;
  interestRate: number;
  prepaymentPenalty: number;
  customOutstandingPrincipal?: number; // Optional: User can override auto-calculated value
}

export interface PrepaymentPlan {
  enableMonthly: boolean;
  monthlyExtra: number;
  enableYearly: boolean;
  yearlyAmount: number;
  yearlyMonth: number; // Which month of year to pay (1-12)
  enableLumpsum: boolean;
  lumpsums: Lumpsum[];
}

export interface FinancialHealth {
  // Income
  monthlyIncome: number;
  otherIncome: number;
  
  // Expenses
  monthlyExpenses: number;
  monthlyExpensesExcludingLoan: number;
  
  // Savings & Emergency
  emergencyFund: number;
  liquidSavings: number;
  
  // Investments
  totalInvestments: number;
  monthlyInvestmentSIP: number;
  
  // Liabilities
  otherLoans: number;
  creditCardDebt: number;
}

export interface Lumpsum {
  id: string;
  month: number;
  amount: number;
  description: string;
}

export interface InvestmentOption {
  name: string;
  expectedReturn: number;
  taxRate: number;
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  lockIn: string;
}

export interface ScenarioResult {
  name: string;
  totalInterestPaid: number;
  investmentReturns: number;
  netWorth: number;
  loanCompletionMonth: number;
  liquidity: number;
  riskLevel: string;
  score: number;
}

export interface AmortizationRow {
  month: number;
  date: string;
  emi: number;
  interest: number;
  principal: number;
  extra: number;
  lumpsum: number;
  balance: number;
  cumulativeInterest: number;
}
