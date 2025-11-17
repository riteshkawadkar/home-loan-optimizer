import { LoanInfo, InvestmentOption, PrepaymentPlan } from '../types';
import { calculateScenario, formatLargeNumber, calculateOutstandingPrincipal } from '../utils/calculations';

interface Props {
  loanInfo: LoanInfo;
  prepaymentPlan: PrepaymentPlan;
  surplusAmount: number;
  selectedInvestment: InvestmentOption;
}

export default function ScenarioComparison({ loanInfo, prepaymentPlan, surplusAmount, selectedInvestment }: Props) {
  const startDate = new Date();
  const monthsElapsed = (startDate.getFullYear() - new Date(loanInfo.startDate + '-01').getFullYear()) * 12 + 
                        (startDate.getMonth() - new Date(loanInfo.startDate + '-01').getMonth());
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );
  
  const scenarios = [
    { name: 'Current Plan', prepayment: 0, investment: 0, description: 'No changes' },
    { name: 'Full Prepayment', prepayment: 100, investment: 0, description: 'All surplus to loan' },
    { name: 'Full Investment', prepayment: 0, investment: 100, description: 'All surplus invested' },
    { name: 'Balanced 50-50', prepayment: 50, investment: 50, description: 'Equal split' },
    { name: 'Debt Focus 70-30', prepayment: 70, investment: 30, description: 'Prioritize loan' },
    { name: 'Wealth Focus 30-70', prepayment: 30, investment: 70, description: 'Prioritize investment' }
  ];

  const results = scenarios.map(scenario => {
    if (scenario.prepayment === 0 && scenario.investment === 0) {
      // Current plan - no prepayment
      return calculateScenario(loanInfo, 0, 0, 0, selectedInvestment, startDate, outstandingPrincipal);
    }
    return calculateScenario(
      loanInfo, 
      scenario.prepayment, 
      scenario.investment, 
      surplusAmount, 
      selectedInvestment, 
      startDate,
      outstandingPrincipal
    );
  });

  // Find best scenario by net worth
  const bestIndex = results.reduce((maxIdx, result, idx, arr) => 
    result.netWorth > arr[maxIdx].netWorth ? idx : maxIdx, 0
  );

  const prepaymentParts = [];
  if (prepaymentPlan.enableMonthly) prepaymentParts.push(`₹${prepaymentPlan.monthlyExtra.toLocaleString()}/month`);
  if (prepaymentPlan.enableYearly) prepaymentParts.push(`₹${prepaymentPlan.yearlyAmount.toLocaleString()}/year`);
  if (prepaymentPlan.enableLumpsum && prepaymentPlan.lumpsums.length > 0) prepaymentParts.push(`${prepaymentPlan.lumpsums.length} lumpsum(s)`);
  const prepaymentInfo = prepaymentParts.length > 0 ? prepaymentParts.join(' + ') : 'No prepayment';

  return (
    <div className="card">
      <h2>🎯 Scenario Comparison</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '12px' }}>
        Comparing different allocation strategies with {selectedInvestment.name} ({selectedInvestment.expectedReturn}% return)
      </p>
      <p style={{ color: '#667eea', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
        Current prepayment plan: {prepaymentInfo}
      </p>

      <div className="scenario-grid">
        {scenarios.map((scenario, idx) => {
          const result = results[idx];
          const isBest = idx === bestIndex && idx > 0;
          
          return (
            <div key={scenario.name} className={`scenario-card ${isBest ? 'best' : ''}`}>
              {isBest && <div className="best-badge">✨ Best Option</div>}
              
              <div className="scenario-title">{scenario.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '16px' }}>
                {scenario.description}
              </div>

              <div className="scenario-metric">
                <span className="metric-label">Interest Paid</span>
                <span className="metric-value negative">
                  {formatLargeNumber(result.totalInterestPaid)}
                </span>
              </div>

              <div className="scenario-metric">
                <span className="metric-label">Investment Returns</span>
                <span className="metric-value positive">
                  {formatLargeNumber(result.investmentReturns)}
                </span>
              </div>

              <div className="scenario-metric">
                <span className="metric-label">Net Benefit</span>
                <span className={`metric-value ${result.netWorth > 0 ? 'positive' : 'negative'}`}>
                  {formatLargeNumber(result.netWorth)}
                </span>
              </div>

              <div className="scenario-metric">
                <span className="metric-label">Loan Free In</span>
                <span className="metric-value">
                  {Math.floor(result.loanCompletionMonth / 12)}y {result.loanCompletionMonth % 12}m
                </span>
              </div>

              <div className="scenario-metric">
                <span className="metric-label">Risk Level</span>
                <span className="metric-value">{result.riskLevel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
