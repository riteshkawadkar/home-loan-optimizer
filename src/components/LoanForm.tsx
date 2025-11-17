import { useState } from 'react';
import { LoanInfo } from '../types';
import { formatCurrency, calculateMonthsElapsed, calculateOutstandingPrincipal } from '../utils/calculations';

interface Props {
  loanInfo: LoanInfo;
  onChange: (info: LoanInfo) => void;
}

export default function LoanForm({ loanInfo, onChange }: Props) {
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false);

  const handleChange = (field: keyof LoanInfo, value: string | number) => {
    onChange({ ...loanInfo, [field]: value });
  };

  const formatIndianNumber = (num: number): string => {
    if (num === 0) return '₹0';
    const numStr = num.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return '₹' + lastThree;
  };

  const convertToIndianWords = (num: number): string => {
    if (num === 0) return '';
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = num % 100;
    
    const parts: string[] = [];
    if (crore > 0) parts.push(`${crore} Crore${crore > 1 ? 's' : ''}`);
    if (lakh > 0) parts.push(`${lakh} Lakh${lakh > 1 ? 's' : ''}`);
    if (thousand > 0) parts.push(`${thousand} Thousand`);
    if (hundred > 0) parts.push(`${hundred} Hundred`);
    if (remainder > 0) parts.push(`${remainder}`);
    
    return parts.join(' ');
  };

  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  
  const autoCalculatedPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );
  
  const outstandingPrincipal = loanInfo.customOutstandingPrincipal ?? autoCalculatedPrincipal;
  const isCustomPrincipal = loanInfo.customOutstandingPrincipal !== undefined;


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
          type="text"
          value={formatIndianNumber(loanInfo.originalAmount)}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            handleChange('originalAmount', Number(value) || 0);
          }}
          placeholder="₹50,00,000"
        />
        <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
          {loanInfo.originalAmount > 0 ? convertToIndianWords(loanInfo.originalAmount) : 'Enter amount'}
        </small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

        <div className="form-group">
          <label>Current EMI</label>
          <input
            type="text"
            value={formatIndianNumber(loanInfo.currentEMI)}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleChange('currentEMI', Number(value) || 0);
            }}
            placeholder="₹25,000"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
      </div>

      <div style={{ 
        marginTop: '16px',
        marginBottom: '16px',
        padding: '16px', 
        background: isCustomPrincipal ? '#fff3e0' : '#e8f8f0', 
        borderRadius: '8px',
        border: `2px solid ${isCustomPrincipal ? '#ff9800' : '#27ae60'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            Outstanding Principal {isCustomPrincipal ? '(Custom)' : '(Auto-calculated)'}
          </div>
          <button
            onClick={() => {
              if (isEditingPrincipal) {
                setIsEditingPrincipal(false);
              } else {
                setIsEditingPrincipal(true);
              }
            }}
            style={{
              padding: '4px 12px',
              background: isEditingPrincipal ? '#e74c3c' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {isEditingPrincipal ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {isEditingPrincipal ? (
          <>
            <input
              type="text"
              value={formatIndianNumber(loanInfo.customOutstandingPrincipal ?? autoCalculatedPrincipal)}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleChange('customOutstandingPrincipal', Number(value) || 0);
              }}
              placeholder="₹35,00,000"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '1.2rem',
                fontWeight: 600,
                border: '2px solid #667eea',
                borderRadius: '6px',
                marginBottom: '8px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => {
                  setIsEditingPrincipal(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  const updated = { ...loanInfo };
                  delete updated.customOutstandingPrincipal;
                  onChange(updated);
                  setIsEditingPrincipal(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Reset to Auto
              </button>
            </div>
            <small style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
              Auto-calculated: {formatCurrency(autoCalculatedPrincipal)}
            </small>
          </>
        ) : (
          <>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: isCustomPrincipal ? '#ff9800' : '#27ae60' }}>
              {formatCurrency(outstandingPrincipal)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>
              {isCustomPrincipal 
                ? `Custom value (Auto: ${formatCurrency(autoCalculatedPrincipal)})`
                : `Based on ${monthsElapsed} months of payments`
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
