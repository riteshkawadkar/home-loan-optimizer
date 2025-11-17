import { LoanInfo, PrepaymentPlan, AmortizationRow, InvestmentOption, FinancialHealth } from '../types';
import { addMonths, format } from 'date-fns';

export const calculateMonthlyInterestRate = (annualRate: number): number => {
  return annualRate / 12 / 100;
};

export const calculateEMI = (principal: number, annualRate: number, months: number): number => {
  const r = calculateMonthlyInterestRate(annualRate);
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

export const generateAmortizationSchedule = (
  loan: LoanInfo,
  prepayment: PrepaymentPlan,
  startDate: Date,
  outstandingPrincipal: number
): AmortizationRow[] => {
  const schedule: AmortizationRow[] = [];
  let balance = outstandingPrincipal;
  let cumulativeInterest = 0;
  let month = 0;
  const monthlyRate = calculateMonthlyInterestRate(loan.interestRate);

  while (balance > 0.01 && month < 600) {
    month++;
    const currentDate = addMonths(startDate, month - 1);
    const interest = balance * monthlyRate;
    let principal = loan.currentEMI - interest;
    
    // Calculate extra payment - can have multiple types active
    let extraPayment = 0;
    let lumpsumAmount = 0;
    
    // Monthly extra payment
    if (prepayment.enableMonthly) {
      extraPayment = prepayment.monthlyExtra;
    }
    
    // Yearly payment
    if (prepayment.enableYearly) {
      const currentMonth = (month - 1) % 12 + 1;
      if (currentMonth === prepayment.yearlyMonth) {
        lumpsumAmount += prepayment.yearlyAmount;
      }
    }
    
    // One-time lumpsums
    if (prepayment.enableLumpsum) {
      const lumpsum = prepayment.lumpsums.find(l => l.month === month);
      if (lumpsum) {
        lumpsumAmount += lumpsum.amount;
      }
    }
    
    // Adjust principal with prepayments
    principal += extraPayment + lumpsumAmount;
    
    // Ensure we don't overpay
    if (principal > balance) {
      principal = balance;
    }
    
    balance -= principal;
    cumulativeInterest += interest;
    
    schedule.push({
      month,
      date: format(currentDate, 'MMM yyyy'),
      emi: Math.round(loan.currentEMI),
      interest: Math.round(interest),
      principal: Math.round(principal - extraPayment - lumpsumAmount),
      extra: Math.round(extraPayment),
      lumpsum: Math.round(lumpsumAmount),
      balance: Math.round(balance),
      cumulativeInterest: Math.round(cumulativeInterest)
    });
    
    if (balance <= 0) break;
  }
  
  return schedule;
};

export const calculateInvestmentReturns = (
  monthlyInvestment: number,
  annualReturn: number,
  months: number,
  lumpsums: { month: number; amount: number }[] = []
): number => {
  const monthlyRate = annualReturn / 12 / 100;
  let futureValue = 0;
  
  for (let month = 1; month <= months; month++) {
    // Add monthly SIP
    futureValue = (futureValue + monthlyInvestment) * (1 + monthlyRate);
    
    // Add lumpsum if any
    const lumpsum = lumpsums.find(l => l.month === month);
    if (lumpsum) {
      futureValue += lumpsum.amount;
    }
  }
  
  return futureValue;
};

export const getLoanAge = (startDate: string): 'new' | 'mid' | 'mature' => {
  const monthsElapsed = calculateMonthsElapsed(startDate);
  const yearsElapsed = monthsElapsed / 12;
  
  if (yearsElapsed <= 5) return 'new';
  if (yearsElapsed <= 15) return 'mid';
  return 'mature';
};

export const getEmergencyFundStatus = (
  emergencyFund: number,
  monthlyExpenses: number
): { status: 'critical' | 'low' | 'adequate' | 'good'; months: number } => {
  const months = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  
  if (months < 3) return { status: 'critical', months };
  if (months < 6) return { status: 'low', months };
  if (months < 12) return { status: 'adequate', months };
  return { status: 'good', months };
};

export interface RecommendationInput {
  loanInfo: LoanInfo;
  financialHealth: FinancialHealth;
  selectedInvestment: InvestmentOption;
  surplusAmount: number;
  outstandingPrincipal: number;
}

export interface Recommendation {
  strategy: string;
  emoji: string;
  title: string;
  description: string;
  prepaymentPercent: number;
  investmentPercent: number;
  priorities: Array<{
    level: string;
    title: string;
    description: string;
  }>;
  reasoning: string[];
}

export const generateRecommendation = (input: RecommendationInput): Recommendation => {
  const { loanInfo, financialHealth, selectedInvestment } = input;
  
  const loanAge = getLoanAge(loanInfo.startDate);
  const emergencyStatus = getEmergencyFundStatus(
    financialHealth.emergencyFund,
    financialHealth.monthlyExpenses
  );
  const postTaxReturn = selectedInvestment.expectedReturn * (1 - selectedInvestment.taxRate / 100);
  const rateDiff = postTaxReturn - loanInfo.interestRate;
  
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const remainingTenure = calculateRemainingTenure(loanInfo.originalTenure, loanInfo.startDate);
  const progressPercent = (monthsElapsed / loanInfo.originalTenure) * 100;
  
  const priorities: Array<{ level: string; title: string; description: string }> = [];
  const reasoning: string[] = [];
  
  // CRITICAL: Emergency Fund Check
  if (emergencyStatus.status === 'critical') {
    priorities.push({
      level: '🔴 CRITICAL',
      title: 'Build Emergency Fund IMMEDIATELY',
      description: `You only have ${emergencyStatus.months.toFixed(1)} months of expenses saved. Build this to at least 6 months (₹${(financialHealth.monthlyExpenses * 6).toLocaleString()}) before any prepayment or aggressive investing.`
    });
    
    return {
      strategy: 'Emergency Fund First',
      emoji: '🚨',
      title: 'URGENT: Build Emergency Fund',
      description: 'Your emergency fund is critically low. This is your top priority before considering loan prepayment or investments.',
      prepaymentPercent: 0,
      investmentPercent: 0,
      priorities,
      reasoning: ['Emergency fund below 3 months is a critical risk', 'All surplus should go to emergency fund first']
    };
  }
  
  if (emergencyStatus.status === 'low') {
    priorities.push({
      level: '🔴 CRITICAL',
      title: 'Strengthen Emergency Fund',
      description: `You have ${emergencyStatus.months.toFixed(1)} months of expenses. Increase to 6-12 months before aggressive prepayment.`
    });
  } else if (emergencyStatus.status === 'adequate') {
    priorities.push({
      level: '🟢 GOOD',
      title: 'Emergency Fund Adequate',
      description: `You have ${emergencyStatus.months.toFixed(1)} months of expenses saved. This is good!`
    });
  } else {
    priorities.push({
      level: '🟢 EXCELLENT',
      title: 'Emergency Fund Strong',
      description: `You have ${emergencyStatus.months.toFixed(1)} months of expenses saved. Excellent financial cushion!`
    });
  }
  
  // Loan Age Based Logic
  if (loanAge === 'new') {
    // New Loan (1-5 years): Focus on wealth building
    reasoning.push('Loan is relatively new (early stage)');
    reasoning.push('Interest component is highest in early years');
    reasoning.push('Long time horizon favors equity investments');
    
    if (rateDiff > 2) {
      // Strong case for investing
      priorities.push({
        level: '🟠 HIGH',
        title: 'Prioritize Wealth Building',
        description: `With ${(loanInfo.originalTenure / 12).toFixed(0)} years ahead, focus on building wealth through investments. Your post-tax return (${postTaxReturn.toFixed(1)}%) significantly exceeds loan rate (${loanInfo.interestRate}%).`
      });
      
      return {
        strategy: 'Wealth Focus (20-80)',
        emoji: '📈',
        title: 'Build Wealth While Managing Debt',
        description: `Your loan is new with ${(remainingTenure / 12).toFixed(1)} years remaining. With strong investment returns (${postTaxReturn.toFixed(1)}% post-tax) vs loan rate (${loanInfo.interestRate}%), focus on wealth creation while making modest prepayments.`,
        prepaymentPercent: 20,
        investmentPercent: 80,
        priorities,
        reasoning
      };
    } else if (rateDiff > 0) {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Balanced Approach',
        description: 'Build wealth while reducing debt burden gradually.'
      });
      
      return {
        strategy: 'Balanced (40-60)',
        emoji: '⚖️',
        title: 'Balance Wealth and Debt Reduction',
        description: `Early in your loan journey with moderate return advantage. Split surplus to build wealth and reduce debt.`,
        prepaymentPercent: 40,
        investmentPercent: 60,
        priorities,
        reasoning
      };
    } else {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Moderate Prepayment Focus',
        description: 'Reduce interest burden while maintaining some investments.'
      });
      
      return {
        strategy: 'Debt Focus (60-40)',
        emoji: '🏦',
        title: 'Reduce Interest Burden Early',
        description: `Your loan rate (${loanInfo.interestRate}%) is higher than post-tax returns. Focus more on prepayment to reduce long-term interest.`,
        prepaymentPercent: 60,
        investmentPercent: 40,
        priorities,
        reasoning
      };
    }
  } else if (loanAge === 'mid') {
    // Mid-stage Loan (5-15 years): Balanced approach
    reasoning.push('Loan is in mid-stage');
    reasoning.push(`${progressPercent.toFixed(0)}% of loan completed`);
    reasoning.push('Balance between debt reduction and wealth building');
    
    if (rateDiff > 1.5) {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Continue Wealth Building',
        description: 'Maintain investment focus while making steady prepayments.'
      });
      
      return {
        strategy: 'Wealth Focus (30-70)',
        emoji: '📊',
        title: 'Maintain Investment Momentum',
        description: `Mid-way through your loan with good progress. Continue building wealth with ${postTaxReturn.toFixed(1)}% returns while making steady prepayments.`,
        prepaymentPercent: 30,
        investmentPercent: 70,
        priorities,
        reasoning
      };
    } else if (rateDiff > -0.5) {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Balanced Strategy',
        description: 'Equal focus on debt reduction and wealth creation.'
      });
      
      return {
        strategy: 'Balanced (50-50)',
        emoji: '⚖️',
        title: 'Equal Focus on Both Goals',
        description: `You're halfway through. With rates nearly equal, split your surplus equally between prepayment and investment.`,
        prepaymentPercent: 50,
        investmentPercent: 50,
        priorities,
        reasoning
      };
    } else {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Accelerate Debt Reduction',
        description: 'Focus on becoming debt-free faster.'
      });
      
      return {
        strategy: 'Debt Focus (70-30)',
        emoji: '🎯',
        title: 'Accelerate Towards Debt Freedom',
        description: `With ${(remainingTenure / 12).toFixed(1)} years left and loan rate higher than returns, prioritize prepayment.`,
        prepaymentPercent: 70,
        investmentPercent: 30,
        priorities,
        reasoning
      };
    }
  } else {
    // Mature Loan (15+ years): Focus on closing it out
    reasoning.push('Loan is in final stage');
    reasoning.push(`${progressPercent.toFixed(0)}% completed - finish line in sight`);
    reasoning.push('Principal component is higher now');
    reasoning.push('Psychological benefit of being debt-free');
    
    if (remainingTenure <= 36) {
      // Less than 3 years left
      priorities.push({
        level: '🟠 HIGH',
        title: 'Close Out the Loan',
        description: `Only ${(remainingTenure / 12).toFixed(1)} years left. Consider aggressive prepayment to become debt-free.`
      });
      
      return {
        strategy: 'Aggressive Prepayment (80-20)',
        emoji: '🏁',
        title: 'Finish Strong - Become Debt Free',
        description: `You're in the final stretch with just ${(remainingTenure / 12).toFixed(1)} years remaining. Focus on closing out the loan for peace of mind.`,
        prepaymentPercent: 80,
        investmentPercent: 20,
        priorities,
        reasoning
      };
    } else if (rateDiff < 0) {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Prioritize Debt Freedom',
        description: 'Focus on prepayment to become debt-free sooner.'
      });
      
      return {
        strategy: 'Debt Focus (70-30)',
        emoji: '🎯',
        title: 'Path to Debt Freedom',
        description: `With ${(remainingTenure / 12).toFixed(1)} years left and loan rate (${loanInfo.interestRate}%) higher than returns, focus on prepayment.`,
        prepaymentPercent: 70,
        investmentPercent: 30,
        priorities,
        reasoning
      };
    } else {
      priorities.push({
        level: '🟠 HIGH',
        title: 'Balanced Final Push',
        description: 'Balance between closing loan and maintaining investments.'
      });
      
      return {
        strategy: 'Balanced (60-40)',
        emoji: '⚖️',
        title: 'Balance Debt Closure and Wealth',
        description: `Final years of your loan. Balance between becoming debt-free and continuing wealth building.`,
        prepaymentPercent: 60,
        investmentPercent: 40,
        priorities,
        reasoning
      };
    }
  }
  
  // Fallback (shouldn't reach here)
  return {
    strategy: 'Balanced (50-50)',
    emoji: '⚖️',
    title: 'Balanced Approach',
    description: 'Split your surplus equally between prepayment and investment.',
    prepaymentPercent: 50,
    investmentPercent: 50,
    priorities,
    reasoning
  };
};

export const calculateScenario = (
  loan: LoanInfo,
  prepaymentPercent: number,
  investmentPercent: number,
  surplusAmount: number,
  investmentOption: InvestmentOption,
  startDate: Date,
  outstandingPrincipal: number
): any => {
  const prepaymentAmount = (surplusAmount * prepaymentPercent) / 100;
  const investmentAmount = (surplusAmount * investmentPercent) / 100;
  
  const prepaymentPlan: PrepaymentPlan = {
    enableMonthly: prepaymentPercent > 0,
    monthlyExtra: prepaymentAmount,
    enableYearly: false,
    yearlyAmount: 0,
    yearlyMonth: 1,
    enableLumpsum: false,
    lumpsums: []
  };
  
  const schedule = generateAmortizationSchedule(loan, prepaymentPlan, startDate, outstandingPrincipal);
  const totalInterestPaid = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const loanCompletionMonth = schedule.length;
  
  // Calculate investment returns
  const investmentReturns = calculateInvestmentReturns(
    investmentAmount,
    investmentOption.expectedReturn,
    loanCompletionMonth
  );
  
  // Apply tax
  const taxOnReturns = (investmentReturns - (investmentAmount * loanCompletionMonth)) * 
    (investmentOption.taxRate / 100);
  const postTaxReturns = investmentReturns - taxOnReturns;
  
  // Calculate net worth
  const netWorth = postTaxReturns - totalInterestPaid;
  
  return {
    name: `${prepaymentPercent}-${investmentPercent} Split`,
    totalInterestPaid,
    investmentReturns: Math.round(postTaxReturns),
    netWorth: Math.round(netWorth),
    loanCompletionMonth,
    liquidity: Math.round(postTaxReturns),
    riskLevel: investmentOption.riskLevel,
    schedule
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatLargeNumber = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return formatCurrency(amount);
};

export const calculateRemainingTenure = (
  originalTenure: number,
  startDate: string
): number => {
  const start = new Date(startDate + '-01');
  const now = new Date();
  const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + 
                        (now.getMonth() - start.getMonth());
  const remaining = originalTenure - monthsElapsed;
  return Math.max(0, remaining);
};

export const calculateMonthsElapsed = (startDate: string): number => {
  const start = new Date(startDate + '-01');
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + 
         (now.getMonth() - start.getMonth());
};

export const calculateOutstandingPrincipal = (
  originalAmount: number,
  emi: number,
  annualRate: number,
  monthsElapsed: number
): number => {
  if (monthsElapsed <= 0) return originalAmount;
  
  const monthlyRate = calculateMonthlyInterestRate(annualRate);
  let balance = originalAmount;
  
  for (let i = 0; i < monthsElapsed; i++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    if (balance <= 0) return 0;
  }
  
  return Math.round(Math.max(0, balance));
};
