import { useState } from 'react';
import { FinancialHealth } from '../types';
import { formatCurrency, getEmergencyFundStatus } from '../utils/calculations';

interface Props {
  financialHealth: FinancialHealth;
  onChange: (health: FinancialHealth) => void;
  showCard?: boolean;
}

export default function FinancialHealthForm({ financialHealth, onChange, showCard = true }: Props) {
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    expenses: true,
    savings: true,
    investments: false,
    liabilities: false,
    goals: false
  });

  const handleChange = (field: keyof FinancialHealth, value: number) => {
    onChange({ ...financialHealth, [field]: value });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const emergencyStatus = getEmergencyFundStatus(
    financialHealth.emergencyFund,
    financialHealth.monthlyExpenses
  );

  const getStatusColor = () => {
    switch (emergencyStatus.status) {
      case 'critical': return '#e74c3c';
      case 'low': return '#f39c12';
      case 'adequate': return '#3498db';
      case 'good': return '#27ae60';
    }
  };

  const getStatusText = () => {
    switch (emergencyStatus.status) {
      case 'critical': return '🔴 Critical - Build immediately';
      case 'low': return '🟡 Low - Needs improvement';
      case 'adequate': return '🔵 Adequate - Good';
      case 'good': return '🟢 Excellent - Well protected';
    }
  };

  // Calculate metrics
  const totalIncome = financialHealth.monthlyIncome + financialHealth.otherIncome;
  const totalAssets = financialHealth.emergencyFund + financialHealth.liquidSavings + 
                      financialHealth.totalInvestments;
  const totalLiabilities = financialHealth.otherLoans + financialHealth.creditCardDebt;
  const netWorth = totalAssets - totalLiabilities;
  const savingsRate = totalIncome > 0 ? ((totalIncome - financialHealth.monthlyExpenses) / totalIncome * 100) : 0;

  const content = (
    <>
      <h2>💼 Complete Financial Profile</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Comprehensive data for AI-powered recommendations
      </p>

      {/* Summary Dashboard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '12px', background: '#e8f8f0', borderRadius: '6px', border: '1px solid #27ae60' }}>
          <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '4px' }}>Net Worth</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#27ae60' }}>
            {formatCurrency(netWorth)}
          </div>
        </div>
        <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #2196f3' }}>
          <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '4px' }}>Monthly Income</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2196f3' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '6px', border: '1px solid #ff9800' }}>
          <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '4px' }}>Savings Rate</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ff9800' }}>
            {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Left Column */}
        <div>
          {/* Income Section */}
          <div style={{ marginBottom: '16px' }}>
            <div 
              onClick={() => toggleSection('income')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: 'var(--input-bg)',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>💰 Income</h3>
              <span style={{ color: 'var(--text-secondary)' }}>{expandedSections.income ? '▼' : '▶'}</span>
            </div>
        {expandedSections.income && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Monthly Income (Salary)</label>
              <input type="number" value={financialHealth.monthlyIncome} 
                onChange={(e) => handleChange('monthlyIncome', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Other Monthly Income</label>
              <input type="number" value={financialHealth.otherIncome} 
                onChange={(e) => handleChange('otherIncome', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Bonus (monthly avg), rental, freelance, etc.</small>
            </div>
          </div>
        )}
          </div>

          {/* Expenses Section */}
          <div style={{ marginBottom: '16px' }}>
        <div 
            onClick={() => toggleSection('expenses')}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: 'var(--input-bg)',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>💸 Expenses</h3>
            <span style={{ color: 'var(--text-secondary)' }}>{expandedSections.expenses ? '▼' : '▶'}</span>
          </div>
        {expandedSections.expenses && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Total Monthly Expenses</label>
              <input type="number" value={financialHealth.monthlyExpenses} 
                onChange={(e) => handleChange('monthlyExpenses', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Including loan EMI</small>
            </div>
            <div className="form-group">
              <label>Monthly Expenses (Excluding Loan)</label>
              <input type="number" value={financialHealth.monthlyExpensesExcludingLoan} 
                onChange={(e) => handleChange('monthlyExpensesExcludingLoan', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>For emergency fund calculation</small>
            </div>
          </div>
        )}
      </div>

      {/* Savings Section */}
      <div style={{ marginBottom: '16px' }}>
        <div 
          onClick={() => toggleSection('savings')}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <h3 style={{ fontSize: '1rem', margin: 0 }}>🏦 Savings & Emergency</h3>
          <span>{expandedSections.savings ? '▼' : '▶'}</span>
        </div>
        {expandedSections.savings && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Emergency Fund</label>
              <input type="number" value={financialHealth.emergencyFund} 
                onChange={(e) => handleChange('emergencyFund', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Liquid Savings</label>
              <input type="number" value={financialHealth.liquidSavings} 
                onChange={(e) => handleChange('liquidSavings', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Savings account, FD, etc.</small>
            </div>
            <div style={{ 
              marginTop: '12px',
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              border: `2px solid ${getStatusColor()}`
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: getStatusColor(), marginBottom: '4px' }}>
                {getStatusText()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                {emergencyStatus.months.toFixed(1)} months of expenses covered
              </div>
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Investments Section */}
          <div style={{ marginBottom: '16px' }}>
        <div 
            onClick={() => toggleSection('investments')}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: 'var(--input-bg)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>📈 Investments</h3>
            <span style={{ color: 'var(--text-secondary)' }}>{expandedSections.investments ? '▼' : '▶'}</span>
          </div>
        {expandedSections.investments && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Total Investment Portfolio</label>
              <input type="number" value={financialHealth.totalInvestments} 
                onChange={(e) => handleChange('totalInvestments', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                All investments: MF, stocks, FD, PPF, bonds, etc.
              </small>
            </div>
            <div className="form-group">
              <label>Monthly SIP</label>
              <input type="number" value={financialHealth.monthlyInvestmentSIP} 
                onChange={(e) => handleChange('monthlyInvestmentSIP', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                Ongoing monthly investment commitments
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Liabilities Section */}
      <div style={{ marginBottom: '16px' }}>
        <div 
          onClick={() => toggleSection('liabilities')}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <h3 style={{ fontSize: '1rem', margin: 0 }}>💳 Other Liabilities</h3>
          <span>{expandedSections.liabilities ? '▼' : '▶'}</span>
        </div>
        {expandedSections.liabilities && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Other Loans</label>
              <input type="number" value={financialHealth.otherLoans} 
                onChange={(e) => handleChange('otherLoans', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Car loan, personal loan, etc.</small>
            </div>
            <div className="form-group">
              <label>Credit Card Debt</label>
              <input type="number" value={financialHealth.creditCardDebt} 
                onChange={(e) => handleChange('creditCardDebt', Number(e.target.value))} />
            </div>
          </div>
        )}
      </div>

      {/* Goals Section */}
      <div style={{ marginBottom: '16px' }}>
        <div 
          onClick={() => toggleSection('goals')}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <h3 style={{ fontSize: '1rem', margin: 0 }}>🎯 Goals & Timeline</h3>
          <span>{expandedSections.goals ? '▼' : '▶'}</span>
        </div>
        {expandedSections.goals && (
          <div style={{ paddingLeft: '12px' }}>
            <div className="form-group">
              <label>Current Age</label>
              <input type="number" value={financialHealth.currentAge} 
                onChange={(e) => handleChange('currentAge', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Retirement Age</label>
              <input type="number" value={financialHealth.retirementAge} 
                onChange={(e) => handleChange('retirementAge', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Number of Dependents</label>
              <input type="number" value={financialHealth.dependents} 
                onChange={(e) => handleChange('dependents', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Children, parents, etc.</small>
            </div>
            <div className="form-group">
              <label>Major Goals Amount</label>
              <input type="number" value={financialHealth.majorGoalsAmount} 
                onChange={(e) => handleChange('majorGoalsAmount', Number(e.target.value))} />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Education, marriage, etc.</small>
            </div>
            <div className="form-group">
              <label>Goals Timeline (years)</label>
              <input type="number" value={financialHealth.majorGoalsTimeline} 
                onChange={(e) => handleChange('majorGoalsTimeline', Number(e.target.value))} />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f0f3ff', 
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#667eea'
      }}>
        💡 Complete profile enables AI to provide highly personalized recommendations based on your entire financial situation
      </div>
    </>
  );

  return showCard ? <div className="card">{content}</div> : content;
}
