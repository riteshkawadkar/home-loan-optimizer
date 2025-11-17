import { useState } from 'react';
import { LoanInfo, PrepaymentPlan } from '../types';
import { generateAmortizationSchedule, formatCurrency, calculateOutstandingPrincipal } from '../utils/calculations';

interface Props {
  loanInfo: LoanInfo;
  prepaymentPlan: PrepaymentPlan;
}

export default function AmortizationTable({ loanInfo, prepaymentPlan }: Props) {
  const [showAll, setShowAll] = useState(false);
  const startDate = new Date(loanInfo.startDate + '-01');
  const monthsElapsed = (new Date().getFullYear() - startDate.getFullYear()) * 12 + 
                        (new Date().getMonth() - startDate.getMonth());
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );
  const schedule = generateAmortizationSchedule(loanInfo, prepaymentPlan, startDate, outstandingPrincipal);
  
  const displaySchedule = showAll ? schedule : schedule.slice(0, 12);
  const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const totalPrincipal = outstandingPrincipal;
  const totalExtra = schedule.reduce((sum, row) => sum + row.extra, 0);
  const totalLumpsum = schedule.reduce((sum, row) => sum + row.lumpsum, 0);

  return (
    <div className="card">
      <h2>📋 Optimized Payment Schedule</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '0.95rem' }}>
        Detailed month-by-month breakdown starting from today with {
          (prepaymentPlan.enableMonthly || prepaymentPlan.enableYearly || prepaymentPlan.enableLumpsum) 
            ? 'prepayments' 
            : 'regular EMI only'
        }
      </p>

      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Loan Completion</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
            {Math.floor(schedule.length / 12)}y {schedule.length % 12}m
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Interest</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e74c3c' }}>
            {formatCurrency(totalInterest)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Principal</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
            {formatCurrency(totalPrincipal)}
          </div>
        </div>
        {(totalExtra > 0 || totalLumpsum > 0) && (
          <div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Prepaid</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#27ae60' }}>
              {formatCurrency(totalExtra + totalLumpsum)}
            </div>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e6ed' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>Month</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>EMI</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Interest</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Principal</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Extra</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Lumpsum</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {displaySchedule.map((row) => (
              <tr 
                key={row.month}
                style={{ 
                  borderBottom: '1px solid #e0e6ed',
                  background: (row.extra > 0 || row.lumpsum > 0) ? '#e8f8f0' : 'white'
                }}
              >
                <td style={{ padding: '10px 8px' }}>{row.month}</td>
                <td style={{ padding: '10px 8px' }}>{row.date}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {formatCurrency(row.emi)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#e74c3c' }}>
                  {formatCurrency(row.interest)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {formatCurrency(row.principal)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: row.extra > 0 ? '#27ae60' : '#7f8c8d' }}>
                  {row.extra > 0 ? formatCurrency(row.extra) : '-'}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: row.lumpsum > 0 ? '#27ae60' : '#7f8c8d' }}>
                  {row.lumpsum > 0 ? formatCurrency(row.lumpsum) : '-'}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > 12 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '10px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            {showAll ? `Show First 12 Months` : `Show All ${schedule.length} Months`}
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        background: '#f0f3ff', 
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#667eea'
      }}>
        💡 Rows highlighted in green indicate months with prepayments
      </div>
    </div>
  );
}
