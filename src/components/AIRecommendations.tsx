import { useState } from 'react';
import { LoanInfo, PrepaymentPlan, InvestmentOption, FinancialHealth } from '../types';
import { 
  calculateOutstandingPrincipal, 
  calculateMonthsElapsed,
  generateAmortizationSchedule,
  calculateInvestmentReturns,
  getLoanAge,
  getEmergencyFundStatus,
  formatCurrency,
  formatLargeNumber
} from '../utils/calculations';
import { calculateOptimalPrepaymentStrategy } from '../utils/aiAnalysis';
import FinancialHealthForm from './FinancialHealthForm';

interface Props {
  loanInfo: LoanInfo;
  financialHealth: FinancialHealth;
  onFinancialHealthChange: (health: FinancialHealth) => void;
  prepaymentPlan: PrepaymentPlan;
  surplusAmount: number;
  selectedInvestment: InvestmentOption;
  onShowOptimalStrategy?: () => void;
}

interface AIInsight {
  category: string;
  icon: string;
  title: string;
  analysis: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
}

export default function AIRecommendations({ 
  loanInfo, 
  financialHealth,
  onFinancialHealthChange,
  prepaymentPlan, 
  surplusAmount,
  selectedInvestment,
  onShowOptimalStrategy
}: Props) {
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  const toggleInsight = (index: number) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInsights(newExpanded);
  };
  
  const startDate = new Date();
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );

  // Calculate optimal strategy for button display
  const investmentPostTaxReturn = selectedInvestment.expectedReturn * (1 - selectedInvestment.taxRate / 100);
  const optimalStrategy = calculateOptimalPrepaymentStrategy(
    surplusAmount,
    loanInfo,
    financialHealth,
    outstandingPrincipal,
    investmentPostTaxReturn
  );

  // Calculate scenarios
  const baselinePlan: PrepaymentPlan = {
    enableMonthly: false,
    monthlyExtra: 0,
    enableYearly: false,
    yearlyAmount: 0,
    yearlyMonth: 1,
    enableLumpsum: false,
    lumpsums: []
  };

  const baselineSchedule = generateAmortizationSchedule(loanInfo, baselinePlan, startDate, outstandingPrincipal);
  const currentSchedule = generateAmortizationSchedule(loanInfo, prepaymentPlan, startDate, outstandingPrincipal);
  
  const baselineInterest = baselineSchedule[baselineSchedule.length - 1]?.cumulativeInterest || 0;
  const currentInterest = currentSchedule[currentSchedule.length - 1]?.cumulativeInterest || 0;
  const interestSaved = baselineInterest - currentInterest;
  
  const baselineMonths = baselineSchedule.length;
  const currentMonths = currentSchedule.length;
  const monthsSaved = baselineMonths - currentMonths;

  // Get context
  const loanAge = getLoanAge(loanInfo.startDate);
  const emergencyStatus = getEmergencyFundStatus(financialHealth.emergencyFund, financialHealth.monthlyExpenses);
  const rateDiff = investmentPostTaxReturn - loanInfo.interestRate;
  const remainingTenure = loanInfo.originalTenure - monthsElapsed;
  const progressPercent = (monthsElapsed / loanInfo.originalTenure) * 100;

  // Calculate total prepayment
  const totalPrepayment = (prepaymentPlan.enableMonthly ? prepaymentPlan.monthlyExtra * currentMonths : 0) +
                          (prepaymentPlan.enableYearly ? prepaymentPlan.yearlyAmount * Math.floor(currentMonths / 12) : 0) +
                          (prepaymentPlan.enableLumpsum ? prepaymentPlan.lumpsums.reduce((sum, l) => sum + l.amount, 0) : 0);

  // Investment analysis
  const prepaymentInvested = totalPrepayment > 0 
    ? calculateInvestmentReturns(totalPrepayment / currentMonths, investmentPostTaxReturn, currentMonths)
    : 0;

  // Generate AI insights
  const insights: AIInsight[] = [];

  // 1. Emergency Fund Analysis
  if (emergencyStatus.status === 'critical') {
    insights.push({
      category: 'Financial Safety',
      icon: '🚨',
      title: 'Critical: Emergency Fund Insufficient',
      analysis: `Your emergency fund of ${formatCurrency(financialHealth.emergencyFund)} covers only ${emergencyStatus.months.toFixed(1)} months of expenses. This is below the minimum recommended 3 months and puts you at significant financial risk.`,
      recommendation: `STOP all prepayments and investments immediately. Redirect your entire surplus of ${formatCurrency(surplusAmount)}/month to build emergency fund to at least ${formatCurrency(financialHealth.monthlyExpenses * 6)} (6 months). This will take approximately ${Math.ceil((financialHealth.monthlyExpenses * 6 - financialHealth.emergencyFund) / surplusAmount)} months.`,
      priority: 'critical',
      impact: 'Protects you from financial emergencies and job loss'
    });
  } else if (emergencyStatus.status === 'low') {
    insights.push({
      category: 'Financial Safety',
      icon: '⚠️',
      title: 'Emergency Fund Needs Strengthening',
      analysis: `Your emergency fund covers ${emergencyStatus.months.toFixed(1)} months. While above minimum, it's below the recommended 6-12 months for optimal security.`,
      recommendation: `Allocate 30-40% of surplus (${formatCurrency(surplusAmount * 0.35)}/month) to emergency fund until you reach ${formatCurrency(financialHealth.monthlyExpenses * 8)} (8 months). Continue with reduced prepayment/investment.`,
      priority: 'high',
      impact: 'Improves financial resilience and peace of mind'
    });
  } else {
    insights.push({
      category: 'Financial Safety',
      icon: '✅',
      title: 'Emergency Fund Strong',
      analysis: `Excellent! Your emergency fund of ${formatCurrency(financialHealth.emergencyFund)} covers ${emergencyStatus.months.toFixed(1)} months of expenses. You're well-protected against financial shocks.`,
      recommendation: 'Maintain current emergency fund level. You can confidently pursue aggressive prepayment or investment strategies.',
      priority: 'low',
      impact: 'Strong financial foundation established'
    });
  }

  // 2. Loan Stage Analysis
  if (loanAge === 'new') {
    insights.push({
      category: 'Loan Lifecycle',
      icon: '🌱',
      title: 'Early Stage Loan - Maximum Flexibility',
      analysis: `Your loan is ${(monthsElapsed / 12).toFixed(1)} years old (${progressPercent.toFixed(0)}% complete). You have ${(remainingTenure / 12).toFixed(1)} years ahead. Interest component is currently highest, but you also have maximum time for investments to compound.`,
      recommendation: rateDiff > 1 
        ? `With ${(remainingTenure / 12).toFixed(0)} years remaining and investment returns (${investmentPostTaxReturn.toFixed(1)}%) exceeding loan rate (${loanInfo.interestRate}%), prioritize wealth building. Allocate 70-80% to investments, 20-30% to prepayment. Your youth is your biggest asset - let compound interest work for you.`
        : `Even though loan rate is higher, consider a 50-50 split. You have time to build wealth while managing debt. Don't be too aggressive on prepayment - you'll need liquidity for life events (marriage, children, etc.).`,
      priority: 'high',
      impact: `Optimal strategy could result in ${formatLargeNumber(Math.abs(rateDiff * surplusAmount * currentMonths / 100))} additional wealth over loan tenure`
    });
  } else if (loanAge === 'mid') {
    insights.push({
      category: 'Loan Lifecycle',
      icon: '⚖️',
      title: 'Mid-Stage Loan - Balance is Key',
      analysis: `Your loan is ${(monthsElapsed / 12).toFixed(1)} years old (${progressPercent.toFixed(0)}% complete). You've made significant progress. Interest/principal split is becoming more balanced.`,
      recommendation: rateDiff > 0.5
        ? `Continue balanced approach with slight tilt towards investment (60-40 split). You've proven you can manage the loan, now focus on building retirement corpus. Target ${formatCurrency(financialHealth.totalInvestments * 2)} in investments by loan completion.`
        : `Shift focus to debt reduction (60-40 towards prepayment). You're past the halfway mark - accelerate towards debt freedom. This will free up EMI for retirement savings in ${(remainingTenure / 12).toFixed(0)} years.`,
      priority: 'high',
      impact: 'Sets foundation for debt-free retirement years'
    });
  } else {
    insights.push({
      category: 'Loan Lifecycle',
      icon: '🏁',
      title: 'Final Stage - Finish Line in Sight',
      analysis: `Your loan is ${(monthsElapsed / 12).toFixed(1)} years old (${progressPercent.toFixed(0)}% complete). Only ${(remainingTenure / 12).toFixed(1)} years remaining! Principal component is now dominant.`,
      recommendation: remainingTenure <= 36
        ? `With less than 3 years left, consider aggressive prepayment (80-20 split). The psychological and financial benefit of being debt-free is immense. You could be debt-free in just ${Math.floor((remainingTenure - monthsSaved) / 12)} years ${(remainingTenure - monthsSaved) % 12} months with current strategy!`
        : `Focus on debt closure (70-30 towards prepayment). Being debt-free will give you complete financial freedom to maximize retirement savings. Your EMI of ${formatCurrency(loanInfo.currentEMI)} will become available for investments.`,
      priority: 'high',
      impact: `Becoming debt-free frees up ${formatCurrency(loanInfo.currentEMI)}/month for retirement or other goals`
    });
  }

  // 3. Current Strategy Analysis
  if (totalPrepayment > 0) {
    // Calculate annualized ROI for proper comparison with investment returns
    const totalROI = (interestSaved / totalPrepayment) * 100;
    const years = currentMonths / 12;
    const annualizedROI = years > 0 ? (Math.pow(1 + interestSaved / totalPrepayment, 1 / years) - 1) * 100 : 0;
    
    // Calculate investment gains for comparison
    const investmentGains = prepaymentInvested - totalPrepayment;
    const netBenefit = interestSaved - investmentGains;
    
    insights.push({
      category: 'Current Strategy',
      icon: '📊',
      title: 'Your Prepayment Strategy Analysis',
      analysis: `You're prepaying ${formatLargeNumber(totalPrepayment)} total (${prepaymentPlan.enableMonthly ? `₹${prepaymentPlan.monthlyExtra}/month` : ''}${prepaymentPlan.enableYearly ? ` + ₹${prepaymentPlan.yearlyAmount}/year` : ''}${prepaymentPlan.enableLumpsum ? ` + ${prepaymentPlan.lumpsums.length} lumpsums` : ''}). This saves ${formatLargeNumber(interestSaved)} in interest (${totalROI.toFixed(1)}% total return, ${annualizedROI.toFixed(1)}% annualized) and reduces tenure by ${Math.floor(monthsSaved / 12)}y ${monthsSaved % 12}m.`,
      recommendation: netBenefit > 0
        ? `Excellent! Prepaying saves ${formatLargeNumber(interestSaved)} in interest vs ${formatLargeNumber(investmentGains)} you'd gain by investing - a net benefit of ${formatLargeNumber(netBenefit)}. This is a guaranteed, risk-free return. Continue this strategy - you're making the mathematically optimal choice.`
        : `Investing would be better. You'd gain ${formatLargeNumber(investmentGains)} from investments vs ${formatLargeNumber(interestSaved)} saved in interest - a difference of ${formatLargeNumber(Math.abs(netBenefit))}. Consider reducing prepayment by 30-40% and investing the difference for better returns.`,
      priority: 'high',
      impact: `Current strategy: ${netBenefit > 0 ? 'Optimal' : 'Sub-optimal'} - ${netBenefit > 0 ? 'gaining' : 'missing'} ${formatLargeNumber(Math.abs(netBenefit))}`
    });
  } else {
    insights.push({
      category: 'Current Strategy',
      icon: '💤',
      title: 'No Prepayment Strategy Active',
      analysis: `You're not making any prepayments. Your loan will take full ${(baselineMonths / 12).toFixed(1)} years and you'll pay ${formatLargeNumber(baselineInterest)} in total interest.`,
      recommendation: `Start with a modest prepayment of ${formatCurrency(surplusAmount * 0.3)}/month (30% of surplus). This alone would save ${formatLargeNumber(baselineInterest * 0.15)} in interest and reduce tenure by ${Math.floor(baselineMonths * 0.15 / 12)} years. Low commitment, high impact!`,
      priority: 'high',
      impact: `Even small prepayments can save lakhs in interest`
    });
  }

  // 4. Investment Portfolio Analysis
  const investmentRatio = financialHealth.totalInvestments / outstandingPrincipal;
  insights.push({
    category: 'Wealth Building',
    icon: '💰',
    title: investmentRatio > 0.5 ? 'Strong Investment Portfolio' : 'Investment Portfolio Needs Attention',
    analysis: `Your investments (${formatLargeNumber(financialHealth.totalInvestments)}) are ${(investmentRatio * 100).toFixed(0)}% of your loan (${formatLargeNumber(outstandingPrincipal)}). Monthly SIP: ${formatCurrency(financialHealth.monthlyInvestmentSIP)}.`,
    recommendation: investmentRatio > 0.5
      ? `Great asset-to-debt ratio! Continue SIP and consider increasing by 10% annually. With ${(remainingTenure / 12).toFixed(0)} years left, your investments could grow to ${formatLargeNumber(financialHealth.totalInvestments * Math.pow(1 + investmentPostTaxReturn / 100, remainingTenure / 12))} by loan completion.`
      : `Your investments are low relative to debt. Increase SIP to at least ${formatCurrency(financialHealth.monthlyInvestmentSIP + surplusAmount * 0.4)} (add ${formatCurrency(surplusAmount * 0.4)} from surplus). Target: Match loan amount in investments by loan completion. This builds a safety net while managing debt.`,
    priority: investmentRatio < 0.3 ? 'high' : 'medium',
    impact: `Building parallel wealth provides options and security`
  });

  // 5. Tax Optimization
  const annualPrepayment = (prepaymentPlan.enableMonthly ? prepaymentPlan.monthlyExtra * 12 : 0) +
                           (prepaymentPlan.enableYearly ? prepaymentPlan.yearlyAmount : 0);
  const estimatedInterest = (outstandingPrincipal * loanInfo.interestRate / 100);
  
  insights.push({
    category: 'Tax Optimization',
    icon: '📋',
    title: 'Tax Benefits Analysis',
    analysis: `Annual prepayment: ${formatCurrency(annualPrepayment)}. Estimated interest: ${formatCurrency(estimatedInterest)}. You can claim 80C (principal up to ₹1.5L) and 24(b) (interest up to ₹2L).`,
    recommendation: annualPrepayment < 150000
      ? `You're not maximizing 80C. Increase annual prepayment to ₹1.5L (${formatCurrency(150000 / 12)}/month) to get full ₹46,500 tax benefit (at 31% tax rate). This is essentially free money from the government!`
      : estimatedInterest > 200000
      ? `You're already getting maximum 24(b) benefit (₹2L interest). Focus on reducing principal faster to lower future interest and maximize 80C benefit.`
      : `Good tax optimization. You're claiming both 80C and 24(b) benefits. Total annual tax saving: approximately ${formatCurrency(Math.min(annualPrepayment, 150000) * 0.31 + Math.min(estimatedInterest, 200000) * 0.31)}.`,
    priority: annualPrepayment < 150000 ? 'medium' : 'low',
    impact: `Potential tax savings: ${formatCurrency((150000 - Math.min(annualPrepayment, 150000)) * 0.31)}/year`
  });

  // 6. Risk Assessment
  const totalMonthlyCommitment = loanInfo.currentEMI + (prepaymentPlan.enableMonthly ? prepaymentPlan.monthlyExtra : 0) + financialHealth.monthlyInvestmentSIP;
  const commitmentRatio = totalMonthlyCommitment / (financialHealth.monthlyExpenses * 2); // Assuming income is 2x expenses
  
  insights.push({
    category: 'Risk Management',
    icon: '🛡️',
    title: commitmentRatio > 0.6 ? 'High Financial Commitment' : 'Healthy Financial Commitment',
    analysis: `Total monthly commitment: ${formatCurrency(totalMonthlyCommitment)} (EMI + prepayment + SIP). This is ${(commitmentRatio * 100).toFixed(0)}% of estimated income.`,
    recommendation: commitmentRatio > 0.6
      ? `⚠️ Your commitments are high. If income drops, you'll be stressed. Reduce prepayment by 30% and keep that as flexible savings. Maintain EMI and essential SIP only. Build a buffer of ${formatCurrency(totalMonthlyCommitment * 3)} for 3 months of commitments.`
      : `Healthy commitment level. You have room to increase prepayment or investment by ${formatCurrency((0.6 - commitmentRatio) * financialHealth.monthlyExpenses * 2)} if desired. But current balance is sustainable and safe.`,
    priority: commitmentRatio > 0.6 ? 'high' : 'low',
    impact: 'Ensures financial sustainability and reduces stress'
  });

  // 7. Opportunity Cost Analysis
  const opportunityCost = prepaymentInvested - totalPrepayment - interestSaved;
  if (Math.abs(opportunityCost) > 100000) {
    insights.push({
      category: 'Opportunity Cost',
      icon: opportunityCost > 0 ? '📈' : '📉',
      title: opportunityCost > 0 ? 'Significant Investment Opportunity' : 'Prepayment is Optimal',
      analysis: `If you invested your prepayment amount instead, you'd have ${formatLargeNumber(prepaymentInvested)} vs saving ${formatLargeNumber(interestSaved)} in interest. Net difference: ${formatLargeNumber(Math.abs(opportunityCost))}.`,
      recommendation: opportunityCost > 0
        ? `The math favors investing. Consider this hybrid approach: Keep 40% prepayment (guaranteed savings) + 60% investment (growth potential). This balances risk and return. You'd still save ${formatLargeNumber(interestSaved * 0.4)} in interest while building ${formatLargeNumber(prepaymentInvested * 0.6)} in wealth.`
        : `Prepaying is the right choice! You're saving more in guaranteed interest (${formatLargeNumber(interestSaved)}) than you'd gain from risky investments (${formatLargeNumber(prepaymentInvested - totalPrepayment)}). Plus, you get peace of mind and debt reduction.`,
      priority: 'medium',
      impact: `Optimal allocation could improve outcome by ${formatLargeNumber(Math.abs(opportunityCost) * 0.5)}`
    });
  }

  // 8. Timeline Recommendation
  const yearsToFreedom = currentMonths / 12;
  insights.push({
    category: 'Timeline',
    icon: '⏰',
    title: `Path to Debt Freedom: ${yearsToFreedom.toFixed(1)} Years`,
    analysis: `Current trajectory: Debt-free by ${new Date(Date.now() + currentMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}. ${monthsSaved > 0 ? `You're already ${Math.floor(monthsSaved / 12)}y ${monthsSaved % 12}m ahead of schedule!` : 'On original schedule.'}`,
    recommendation: yearsToFreedom > 10
      ? `${(remainingTenure / 12).toFixed(0)} years is a long time. Don't over-commit to prepayment. Life will change - marriage, kids, career moves. Keep 60% of surplus flexible (investments). Prepay 40% for steady progress without over-commitment.`
      : yearsToFreedom > 5
      ? `${yearsToFreedom.toFixed(0)} years is manageable. Maintain current pace. Consider one-time prepayments from bonuses/windfalls to accelerate. Each ₹1L prepaid now saves approximately ${formatCurrency(100000 * loanInfo.interestRate / 100 * yearsToFreedom)} in interest.`
      : `Less than 5 years to go! Consider aggressive prepayment if you can. The finish line is close. Being debt-free will free up ${formatCurrency(loanInfo.currentEMI)}/month for other goals. Push hard now for maximum psychological and financial benefit.`,
    priority: 'medium',
    impact: 'Aligns strategy with life stage and goals'
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="card">
      {/* Optimal Strategy Button */}
      <button
        onClick={() => onShowOptimalStrategy && onShowOptimalStrategy()}
        style={{
          width: '100%',
          padding: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '16px',
          marginBottom: '24px',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
          textAlign: 'left'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.5rem' }}>🎯</span>
              <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                View Your Optimal Strategy
              </h3>
            </div>
            <p style={{ fontSize: '1rem', margin: 0, opacity: 0.95, marginLeft: '56px' }}>
              AI-powered prepayment plan based on your financial profile
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', marginLeft: '56px', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)'
              }}>
                {optimalStrategy.riskLevel}
              </span>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: optimalStrategy.confidence === 'high' ? 'rgba(46, 204, 113, 0.4)' : 
                           optimalStrategy.confidence === 'medium' ? 'rgba(241, 196, 15, 0.4)' : 
                           'rgba(231, 76, 60, 0.4)',
                backdropFilter: 'blur(10px)'
              }}>
                {optimalStrategy.confidence} confidence
              </span>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)'
              }}>
                Save {formatLargeNumber(optimalStrategy.expectedInterestSaved)}
              </span>
            </div>
          </div>
          <div style={{ 
            fontSize: '2rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            →
          </div>
        </div>
      </button>

      {/* Financial Profile Section */}
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px var(--card-shadow)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💼</span>
            <span>Want More Personalized Insights?</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Provide your complete financial profile for deeper AI analysis and tailored recommendations
          </p>
        </div>

        {/* AI Analysis Description */}
        <div style={{ 
          marginBottom: '16px',
          padding: '12px 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <span>🤖</span>
            <span>AI-Powered Financial Analysis</span>
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
            Comprehensive analysis of your loan, investments, and financial health with personalized recommendations
            based on {insights.length} key factors.
          </p>
        </div>

        {!showDetailedForm ? (
          <button
            onClick={() => setShowDetailedForm(true)}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(240, 147, 251, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(240, 147, 251, 0.3)';
            }}
          >
            <span>📊</span>
            <span>Provide Financial Details for Detailed Insights</span>
          </button>
        ) : (
          <div>
            <FinancialHealthForm
              financialHealth={financialHealth}
              onChange={onFinancialHealthChange}
              showCard={false}
            />
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  setShowDetailedForm(false);
                  if (onShowOptimalStrategy) {
                    onShowOptimalStrategy();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <span>See New Optimized AI Plan</span>
              </button>
              
              <button
                onClick={() => setShowDetailedForm(false)}
                style={{
                  padding: '16px 24px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, idx) => {
          const isExpanded = expandedInsights.has(idx);
          return (
            <div 
              key={idx}
              style={{ 
                background: insight.priority === 'critical' ? '#fff5f5' : insight.priority === 'high' ? '#fffbf0' : '#f8f9fa',
                borderRadius: '12px',
                border: `2px solid ${
                  insight.priority === 'critical' ? '#e74c3c' : 
                  insight.priority === 'high' ? '#f39c12' : 
                  insight.priority === 'medium' ? '#3498db' : 
                  '#95a5a6'
                }`,
                overflow: 'hidden'
              }}
            >
              {/* Header - Always visible */}
              <div 
                onClick={() => toggleInsight(idx)}
                style={{ 
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s',
                  background: isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ fontSize: '1.8rem' }}>{insight.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#2c3e50' }}>
                        {insight.title}
                      </h3>
                      <span style={{ 
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: insight.priority === 'critical' ? '#e74c3c' : 
                                   insight.priority === 'high' ? '#f39c12' : 
                                   insight.priority === 'medium' ? '#3498db' : '#95a5a6',
                        color: 'white'
                      }}>
                        {insight.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      {insight.category}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  color: '#7f8c8d',
                  transition: 'transform 0.3s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </div>

              {/* Expandable content */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2c3e50', marginBottom: '8px' }}>
                      📊 Analysis:
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#34495e', lineHeight: '1.6', paddingLeft: '24px' }}>
                      {insight.analysis}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2c3e50', marginBottom: '8px' }}>
                      💡 Recommendation:
                    </div>
                    <div style={{ 
                      fontSize: '0.95rem', 
                      color: '#2c3e50', 
                      lineHeight: '1.6',
                      paddingLeft: '24px',
                      fontWeight: 500
                    }}>
                      {insight.recommendation}
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#667eea',
                    fontWeight: 500
                  }}>
                    <strong>Impact:</strong> {insight.impact}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>🎯 Summary Action Plan</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
          {insights
            .filter(i => i.priority === 'critical' || i.priority === 'high')
            .slice(0, 5)
            .map((insight, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem' }}>
                <strong>{insight.title}</strong>: {insight.recommendation.split('.')[0]}.
              </li>
            ))}
        </ol>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          backdropFilter: 'blur(10px)'
        }}>
          💡 <strong>Remember:</strong> These recommendations are based on mathematical analysis. Your personal circumstances, 
          risk tolerance, and life goals should guide final decisions. Review and adjust quarterly as your situation evolves.
        </div>
      </div>
    </div>
  );
}
