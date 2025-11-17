import { LoanInfo, InvestmentOption, FinancialHealth } from '../types';
import { generateRecommendation, calculateOutstandingPrincipal, calculateMonthsElapsed } from '../utils/calculations';

interface Props {
  loanInfo: LoanInfo;
  financialHealth: FinancialHealth;
  surplusAmount: number;
  selectedInvestment: InvestmentOption;
}

export default function RecommendationEngine({ loanInfo, financialHealth, surplusAmount, selectedInvestment }: Props) {
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );

  const recommendation = generateRecommendation({
    loanInfo,
    financialHealth,
    selectedInvestment,
    surplusAmount,
    outstandingPrincipal
  });

  const postTaxReturn = selectedInvestment.expectedReturn * (1 - selectedInvestment.taxRate / 100);

  return (
    <div className="card">
      <div className="recommendation-box">
        <h3>{recommendation.emoji} Your Optimal Strategy: {recommendation.strategy}</h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{recommendation.description}</p>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
            💡 Recommended Split:
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem' }}>
            <div>
              <div style={{ opacity: 0.9 }}>Prepayment:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{recommendation.prepaymentPercent}%</div>
            </div>
            <div>
              <div style={{ opacity: 0.9 }}>Investment:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{recommendation.investmentPercent}%</div>
            </div>
          </div>
        </div>

        {recommendation.reasoning.length > 0 && (
          <div style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.9 }}>
            <strong>Why this strategy?</strong>
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              {recommendation.reasoning.map((reason, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.9 }}>
          <strong>The Math:</strong> {selectedInvestment.name} at {selectedInvestment.expectedReturn}% 
          (post-tax: {postTaxReturn.toFixed(1)}%) vs loan at {loanInfo.interestRate}%
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>📋 Action Priorities</h3>
        <ul className="priority-list">
          {recommendation.priorities.map((priority, idx) => (
            <li key={idx} className="priority-item">
              <strong>{priority.level}: {priority.title}</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{priority.description}</div>
            </li>
          ))}
        </ul>
      </div>

      {loanInfo.prepaymentPenalty > 1 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#fff3cd', 
          borderRadius: '6px',
          border: '1px solid #ffc107',
          fontSize: '0.9rem',
          color: '#856404'
        }}>
          ⚠️ Note: Your {loanInfo.prepaymentPenalty}% prepayment penalty is factored into calculations. 
          Consider negotiating with your lender or timing prepayments during penalty-free windows.
        </div>
      )}
    </div>
  );
}
