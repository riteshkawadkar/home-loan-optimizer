import { LoanInfo } from '../types';
import { formatCurrency, calculateRemainingTenure, calculateMonthsElapsed, calculateOutstandingPrincipal } from '../utils/calculations';
import { addMonths, format } from 'date-fns';

interface Props {
  loanInfo: LoanInfo;
  onChange: (info: LoanInfo) => void;
}

export default function LoanForm({ loanInfo, onChange }: Props) {
  const handleChange = (field: keyof LoanInfo, value: string | number) => {
    onChange({ ...loanInfo, [field]: value });
  };

  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const remainingTenure = calculateRemainingTenure(loanInfo.originalTenure, loanInfo.startDate);
  const progressPercent = (monthsElapsed / loanInfo.originalTenure) * 100;
  
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );
  
  const startDate = new Date(loanInfo.startDate + '-01');
  const endDate = addMonths(startDate, loanInfo.originalTenure);


  return (
    <div className="card">
      <h2>💰 Loan Information</h2>
      
      <div className="form-group">
        <label>Loan Start Date</label>
        <input
          type="month"
          value={loanInfo.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Original Loan Amount</label>
        <input
          type="number"
          value={loanInfo.originalAmount}
          onChange={(e) => handleChange('originalAmount', Number(e.target.value))}
        />
        <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
          {formatCurrency(loanInfo.originalAmount)}
        </small>
      </div>

      <div className="form-group">
        <label>Original Tenure (months)</label>
        <input
          type="number"
          value={loanInfo.originalTenure}
          onChange={(e) => handleChange('originalTenure', Number(e.target.value))}
        />
        <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
          {Math.floor(loanInfo.originalTenure / 12)} years
        </small>
      </div>

      <div style={{ 
        marginTop: '16px',
        marginBottom: '16px',
        padding: '16px', 
        background: '#e8f8f0', 
        borderRadius: '8px',
        border: '2px solid #27ae60'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '4px' }}>
          Outstanding Principal (Auto-calculated)
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#27ae60' }}>
          {formatCurrency(outstandingPrincipal)}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>
          Based on {monthsElapsed} months of payments
        </div>
      </div>

      <div className="form-group">
        <label>Current EMI</label>
        <input
          type="number"
          value={loanInfo.currentEMI}
          onChange={(e) => handleChange('currentEMI', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Interest Rate (% p.a.)</label>
        <input
          type="number"
          step="0.1"
          value={loanInfo.interestRate}
          onChange={(e) => handleChange('interestRate', Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Prepayment Penalty (%)</label>
        <input
          type="number"
          step="0.1"
          value={loanInfo.prepaymentPenalty}
          onChange={(e) => handleChange('prepaymentPenalty', Number(e.target.value))}
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e0e6ed'
      }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#2c3e50' }}>📅 Loan Timeline</h3>
        
        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: '#7f8c8d' }}>Started:</span>{' '}
          <strong>{format(startDate, 'MMM yyyy')}</strong>
        </div>
        
        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: '#7f8c8d' }}>Original End:</span>{' '}
          <strong>{format(endDate, 'MMM yyyy')}</strong>
        </div>
        
        <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: '#7f8c8d' }}>Time Elapsed:</span>{' '}
          <strong>{Math.floor(monthsElapsed / 12)}y {monthsElapsed % 12}m</strong>
        </div>
        
        <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
          <span style={{ color: '#7f8c8d' }}>Remaining:</span>{' '}
          <strong style={{ color: '#667eea' }}>
            {Math.floor(remainingTenure / 12)}y {remainingTenure % 12}m
          </strong>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Progress</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{progressPercent.toFixed(1)}%</span>
          </div>
          <div style={{ 
            height: '8px', 
            background: '#e0e6ed', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              width: `${progressPercent}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
