import { FinancialHealth, LoanInfo } from '../types';
import { formatCurrency, formatLargeNumber } from './calculations';

export interface FinancialMetrics {
  // Income metrics
  totalMonthlyIncome: number;
  annualIncome: number;
  
  // Expense metrics
  savingsRate: number;
  expenseRatio: number;
  loanToIncomeRatio: number;
  
  // Asset metrics
  totalAssets: number;
  liquidAssets: number;
  investmentAssets: number;
  netWorth: number;
  
  // Liability metrics
  totalLiabilities: number;
  debtToIncomeRatio: number;
  debtToAssetRatio: number;
  
  // Investment metrics
  equityAllocation: number;
  debtAllocation: number;
  sipToIncomeRatio: number;
}

export function calculateFinancialMetrics(
  financialHealth: FinancialHealth,
  loanInfo: LoanInfo,
  outstandingPrincipal: number
): FinancialMetrics {
  // Income
  const totalMonthlyIncome = financialHealth.monthlyIncome + financialHealth.otherIncome;
  const annualIncome = totalMonthlyIncome * 12;
  
  // Assets
  const liquidAssets = financialHealth.emergencyFund + financialHealth.liquidSavings;
  const investmentAssets = financialHealth.totalInvestments;
  const totalAssets = liquidAssets + investmentAssets;
  
  // Liabilities
  const totalLiabilities = outstandingPrincipal + 
                          financialHealth.otherLoans + 
                          financialHealth.creditCardDebt;
  
  const netWorth = totalAssets - totalLiabilities;
  
  // Ratios
  const savingsRate = totalMonthlyIncome > 0 
    ? ((totalMonthlyIncome - financialHealth.monthlyExpenses) / totalMonthlyIncome * 100) 
    : 0;
  
  const expenseRatio = totalMonthlyIncome > 0 
    ? (financialHealth.monthlyExpenses / totalMonthlyIncome * 100) 
    : 0;
  
  const loanToIncomeRatio = totalMonthlyIncome > 0 
    ? (loanInfo.currentEMI / totalMonthlyIncome * 100) 
    : 0;
  
  const debtToIncomeRatio = totalMonthlyIncome > 0 
    ? (totalLiabilities / annualIncome * 100) 
    : 0;
  
  const debtToAssetRatio = totalAssets > 0 
    ? (totalLiabilities / totalAssets * 100) 
    : 0;
  
  const sipToIncomeRatio = totalMonthlyIncome > 0 
    ? (financialHealth.monthlyInvestmentSIP / totalMonthlyIncome * 100) 
    : 0;
  
  // Investment allocation - simplified (not tracking equity/debt split)
  const equityAllocation = 0; // Not tracked
  const debtAllocation = 0; // Not tracked
  
  return {
    totalMonthlyIncome,
    annualIncome,
    savingsRate,
    expenseRatio,
    loanToIncomeRatio,
    totalAssets,
    liquidAssets,
    investmentAssets,
    netWorth,
    totalLiabilities,
    debtToIncomeRatio,
    debtToAssetRatio,
    equityAllocation,
    debtAllocation,
    sipToIncomeRatio
  };
}

export function getFinancialHealthScore(metrics: FinancialMetrics): {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
} {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Savings rate (20 points)
  if (metrics.savingsRate >= 30) { score += 20; strengths.push('Excellent savings rate'); }
  else if (metrics.savingsRate >= 20) { score += 15; strengths.push('Good savings rate'); }
  else if (metrics.savingsRate >= 10) { score += 10; }
  else { score += 5; weaknesses.push('Low savings rate'); }
  
  // Debt to income (20 points)
  if (metrics.debtToIncomeRatio <= 200) { score += 20; strengths.push('Healthy debt levels'); }
  else if (metrics.debtToIncomeRatio <= 300) { score += 15; }
  else if (metrics.debtToIncomeRatio <= 400) { score += 10; weaknesses.push('High debt burden'); }
  else { score += 5; weaknesses.push('Very high debt burden'); }
  
  // Net worth (20 points)
  if (metrics.netWorth > metrics.annualIncome * 3) { score += 20; strengths.push('Strong net worth'); }
  else if (metrics.netWorth > metrics.annualIncome) { score += 15; }
  else if (metrics.netWorth > 0) { score += 10; }
  else { score += 5; weaknesses.push('Negative net worth'); }
  
  // Investment allocation (15 points)
  if (metrics.sipToIncomeRatio >= 15) { score += 15; strengths.push('Excellent investment discipline'); }
  else if (metrics.sipToIncomeRatio >= 10) { score += 12; strengths.push('Good investment discipline'); }
  else if (metrics.sipToIncomeRatio >= 5) { score += 8; }
  else { score += 4; weaknesses.push('Low investment allocation'); }
  
  // Expense ratio (15 points)
  if (metrics.expenseRatio <= 60) { score += 15; strengths.push('Controlled expenses'); }
  else if (metrics.expenseRatio <= 75) { score += 12; }
  else if (metrics.expenseRatio <= 85) { score += 8; weaknesses.push('High expense ratio'); }
  else { score += 4; weaknesses.push('Very high expense ratio'); }
  
  // Liquidity (10 points)
  const liquidityMonths = metrics.liquidAssets / (metrics.totalMonthlyIncome * 0.6);
  if (liquidityMonths >= 12) { score += 10; strengths.push('Excellent liquidity'); }
  else if (liquidityMonths >= 6) { score += 8; }
  else if (liquidityMonths >= 3) { score += 5; }
  else { score += 2; weaknesses.push('Low liquidity'); }
  
  const grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' = 
    score >= 95 ? 'A+' :
    score >= 85 ? 'A' :
    score >= 75 ? 'B+' :
    score >= 65 ? 'B' :
    score >= 55 ? 'C' :
    score >= 45 ? 'D' : 'F';
  
  return { score, grade, strengths, weaknesses };
}

export function generateDetailedInsights(
  metrics: FinancialMetrics,
  financialHealth: FinancialHealth
): string[] {
  const insights: string[] = [];
  
  // Income insights
  insights.push(`Your total monthly income is ${formatCurrency(metrics.totalMonthlyIncome)} (${formatCurrency(metrics.annualIncome)}/year).`);
  
  if (financialHealth.otherIncome > 0) {
    insights.push(`Other income of ${formatCurrency(financialHealth.otherIncome)}/month supplements your base salary.`);
  }
  
  // Savings insights
  if (metrics.savingsRate >= 30) {
    insights.push(`Outstanding! You're saving ${metrics.savingsRate.toFixed(0)}% of income - well above the recommended 20%.`);
  } else if (metrics.savingsRate >= 20) {
    insights.push(`Good job! You're saving ${metrics.savingsRate.toFixed(0)}% of income, meeting the recommended 20% target.`);
  } else if (metrics.savingsRate >= 10) {
    insights.push(`You're saving ${metrics.savingsRate.toFixed(0)}% of income. Try to increase this to 20% for better financial security.`);
  } else {
    insights.push(`⚠️ Your savings rate is only ${metrics.savingsRate.toFixed(0)}%. This is concerning - aim for at least 20%.`);
  }
  
  // Net worth insights
  if (metrics.netWorth > 0) {
    const netWorthToIncome = metrics.netWorth / metrics.annualIncome;
    insights.push(`Your net worth is ${formatLargeNumber(metrics.netWorth)} (${netWorthToIncome.toFixed(1)}x annual income).`);
    
    if (netWorthToIncome < 1) {
      insights.push(`Target: Build net worth to at least 1x annual income in the next 5 years.`);
    }
  } else {
    insights.push(`⚠️ Your net worth is negative (${formatLargeNumber(metrics.netWorth)}). Focus on debt reduction and asset building.`);
  }
  
  // Debt insights
  if (metrics.debtToIncomeRatio > 300) {
    insights.push(`⚠️ Your debt is ${metrics.debtToIncomeRatio.toFixed(0)}% of annual income - this is high. Prioritize debt reduction.`);
  } else if (metrics.debtToIncomeRatio > 200) {
    insights.push(`Your debt is ${metrics.debtToIncomeRatio.toFixed(0)}% of annual income - manageable but monitor closely.`);
  } else {
    insights.push(`Your debt levels are healthy at ${metrics.debtToIncomeRatio.toFixed(0)}% of annual income.`);
  }
  
  // Investment insights
  if (metrics.investmentAssets > 0) {
    insights.push(`Investment portfolio: ${formatLargeNumber(metrics.investmentAssets)}.`);
  }
  
  return insights;
}

export interface OptimalPrepaymentStrategy {
  monthlyPrepayment: number;
  yearlyPrepayment: number;
  lumpsumPrepayment: number;
  totalAnnualPrepayment: number;
  expectedInterestSaved: number;
  expectedMonthsSaved: number;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
  riskLevel: 'conservative' | 'balanced' | 'aggressive';
}

export function calculateOptimalPrepaymentStrategy(
  monthlySurplus: number,
  loanInfo: LoanInfo,
  financialHealth: FinancialHealth,
  _outstandingPrincipal: number,
  investmentReturn: number
): OptimalPrepaymentStrategy {
  const postTaxReturn = investmentReturn;
  const loanRate = loanInfo.interestRate;
  const rateDiff = postTaxReturn - loanRate;
  
  // Calculate emergency fund status
  const emergencyMonths = financialHealth.emergencyFund / financialHealth.monthlyExpensesExcludingLoan;
  const hasEmergencyFund = emergencyMonths >= 6;
  
  // Calculate loan age and remaining tenure
  const loanAgeYears = (new Date().getTime() - new Date(loanInfo.startDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
  const remainingYears = (loanInfo.originalTenure / 12) - loanAgeYears;
  
  // Determine risk profile based on financial health
  let riskLevel: 'conservative' | 'balanced' | 'aggressive' = 'balanced';
  let prepaymentRatio = 0.5; // Default 50-50 split
  
  // Decision logic
  if (!hasEmergencyFund) {
    // Critical: Build emergency fund first
    riskLevel = 'conservative';
    prepaymentRatio = 0;
    return {
      monthlyPrepayment: 0,
      yearlyPrepayment: 0,
      lumpsumPrepayment: 0,
      totalAnnualPrepayment: 0,
      expectedInterestSaved: 0,
      expectedMonthsSaved: 0,
      rationale: `🚨 PRIORITY: Build emergency fund first! Allocate entire surplus (${formatCurrency(monthlySurplus)}/month) to emergency fund until you reach ${formatCurrency(financialHealth.monthlyExpensesExcludingLoan * 6)} (6 months). This will take ~${Math.ceil((financialHealth.monthlyExpensesExcludingLoan * 6 - financialHealth.emergencyFund) / monthlySurplus)} months. Only then consider prepayment.`,
      confidence: 'high',
      riskLevel: 'conservative'
    };
  }
  
  // Loan rate vs investment return analysis
  if (rateDiff > 2) {
    // Investment returns significantly higher
    riskLevel = 'aggressive';
    prepaymentRatio = 0.3; // 30% prepayment, 70% investment
  } else if (rateDiff > 0.5) {
    // Investment returns moderately higher
    riskLevel = 'balanced';
    prepaymentRatio = 0.4; // 40% prepayment, 60% investment
  } else if (rateDiff > -0.5) {
    // Returns are similar
    riskLevel = 'balanced';
    prepaymentRatio = 0.5; // 50-50 split
  } else if (rateDiff > -2) {
    // Loan rate moderately higher
    riskLevel = 'balanced';
    prepaymentRatio = 0.6; // 60% prepayment, 40% investment
  } else {
    // Loan rate significantly higher
    riskLevel = 'aggressive';
    prepaymentRatio = 0.75; // 75% prepayment, 25% investment
  }
  
  // Adjust based on loan stage
  if (remainingYears < 3) {
    // Final stage - increase prepayment
    prepaymentRatio = Math.min(prepaymentRatio + 0.2, 0.9);
    riskLevel = 'aggressive';
  } else if (remainingYears > 15) {
    // Early stage - reduce prepayment, focus on wealth building
    prepaymentRatio = Math.max(prepaymentRatio - 0.15, 0.2);
  }
  
  // Calculate optimal allocation
  const totalMonthlySurplus = monthlySurplus;
  const monthlyPrepayment = Math.round(totalMonthlySurplus * prepaymentRatio);
  
  // Split prepayment strategy: 70% monthly, 30% yearly (from bonus/windfall)
  const monthlyComponent = Math.round(monthlyPrepayment * 0.7);
  const yearlyComponent = Math.round(monthlyPrepayment * 0.3 * 12);
  
  // Suggest lumpsum from bonus if available
  const bonusAvailable = financialHealth.otherIncome * 12; // Assuming other income includes bonus
  const lumpsumSuggestion = bonusAvailable > 0 ? Math.min(Math.round(bonusAvailable * 0.5), 200000) : 0;
  
  const totalAnnualPrepayment = (monthlyComponent * 12) + yearlyComponent + lumpsumSuggestion;
  
  // Estimate impact (simplified calculation)
  const avgMonthlyPrepayment = totalAnnualPrepayment / 12;
  const estimatedInterestSaved = avgMonthlyPrepayment * remainingYears * (loanRate / 100) * 0.7; // Rough estimate
  const estimatedMonthsSaved = Math.round((avgMonthlyPrepayment / loanInfo.currentEMI) * 12 * 0.8); // Rough estimate
  
  // Generate rationale
  let rationale = '';
  
  if (rateDiff > 1) {
    rationale = `📈 Investment returns (${postTaxReturn.toFixed(1)}%) beat loan rate (${loanRate}%) by ${rateDiff.toFixed(1)}%. Strategy: ${((1 - prepaymentRatio) * 100).toFixed(0)}% invest, ${(prepaymentRatio * 100).toFixed(0)}% prepay. This balances guaranteed savings with growth potential.`;
  } else if (rateDiff < -1) {
    rationale = `💰 Loan rate (${loanRate}%) exceeds investment returns (${postTaxReturn.toFixed(1)}%) by ${Math.abs(rateDiff).toFixed(1)}%. Strategy: ${(prepaymentRatio * 100).toFixed(0)}% prepay for guaranteed savings, ${((1 - prepaymentRatio) * 100).toFixed(0)}% invest for diversification.`;
  } else {
    rationale = `⚖️ Returns are similar (loan: ${loanRate}%, investment: ${postTaxReturn.toFixed(1)}%). Balanced 50-50 approach recommended for optimal risk-return tradeoff.`;
  }
  
  if (remainingYears < 5) {
    rationale += ` With only ${remainingYears.toFixed(1)} years left, prioritizing debt closure for financial freedom.`;
  } else if (remainingYears > 15) {
    rationale += ` With ${remainingYears.toFixed(0)} years remaining, focus on wealth building while managing debt.`;
  }
  
  const confidence: 'high' | 'medium' | 'low' = 
    Math.abs(rateDiff) > 1.5 ? 'high' : 
    Math.abs(rateDiff) > 0.5 ? 'medium' : 'low';
  
  return {
    monthlyPrepayment: monthlyComponent,
    yearlyPrepayment: yearlyComponent,
    lumpsumPrepayment: lumpsumSuggestion,
    totalAnnualPrepayment,
    expectedInterestSaved: estimatedInterestSaved,
    expectedMonthsSaved: estimatedMonthsSaved,
    rationale,
    confidence,
    riskLevel
  };
}
