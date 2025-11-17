import { useState } from 'react';
import { LoanInfo, PrepaymentPlan, InvestmentOption, FinancialHealth } from './types';
import LoanForm from './components/LoanForm';
import PrepaymentForm from './components/PrepaymentForm';
import RecommendationEngine from './components/RecommendationEngine';
import AmortizationTable from './components/AmortizationTable';
import DetailedComparison from './components/DetailedComparison';
import AIRecommendations from './components/AIRecommendations';
import VisualDashboard from './components/VisualDashboard';
import OptimalStrategyModal from './components/OptimalStrategyModal';
import { calculateOutstandingPrincipal, calculateMonthsElapsed, generateAmortizationSchedule } from './utils/calculations';
import { calculateOptimalPrepaymentStrategy } from './utils/aiAnalysis';
import { useTheme } from './contexts/ThemeContext';
import './App.css';

const defaultInvestmentOptions: InvestmentOption[] = [
  { name: 'Equity Mutual Fund', expectedReturn: 12, taxRate: 10, riskLevel: 'High', lockIn: 'None' },
  { name: 'Debt Mutual Fund', expectedReturn: 7.5, taxRate: 20, riskLevel: 'Low', lockIn: 'None' },
  { name: 'Fixed Deposit', expectedReturn: 6.5, taxRate: 30, riskLevel: 'Very Low', lockIn: '1-5 years' },
  { name: 'PPF', expectedReturn: 7.1, taxRate: 0, riskLevel: 'Very Low', lockIn: '15 years' }
];

function App() {
  const { theme, toggleTheme } = useTheme();
  
  const [loanInfo, setLoanInfo] = useState<LoanInfo>({
    startDate: '2020-01',
    originalAmount: 5000000,
    originalTenure: 240,
    currentEMI: 45000,
    interestRate: 7.5,
    prepaymentPenalty: 2
  });

  const [prepaymentPlan, setPrepaymentPlan] = useState<PrepaymentPlan>({
    enableMonthly: false,
    monthlyExtra: 10000,
    enableYearly: false,
    yearlyAmount: 100000,
    yearlyMonth: 3,
    enableLumpsum: false,
    lumpsums: []
  });

  const [financialHealth, setFinancialHealth] = useState<FinancialHealth>({
    // Income
    monthlyIncome: 150000,
    otherIncome: 16667, // Bonus + other income (monthly average)
    
    // Expenses
    monthlyExpenses: 95000,
    monthlyExpensesExcludingLoan: 50000,
    
    // Savings
    emergencyFund: 300000,
    liquidSavings: 200000,
    
    // Investments
    totalInvestments: 1000000,
    monthlyInvestmentSIP: 15000,
    
    // Liabilities
    otherLoans: 0,
    creditCardDebt: 0,
    
    // Goals
    currentAge: 35,
    retirementAge: 60,
    dependents: 2,
    majorGoalsAmount: 2000000,
    majorGoalsTimeline: 10
  });

  const [surplusAmount, setSurplusAmount] = useState<number>(20000);
  const [selectedInvestment] = useState<InvestmentOption>(defaultInvestmentOptions[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'analysis' | 'schedule'>('overview');
  const [showOptimalStrategyModal, setShowOptimalStrategyModal] = useState(false);

  // Calculate metrics for visual dashboard
  const startDate = new Date();
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );
  
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
  const prepaymentSchedule = generateAmortizationSchedule(loanInfo, prepaymentPlan, startDate, outstandingPrincipal);
  
  const baselineInterest = baselineSchedule[baselineSchedule.length - 1]?.cumulativeInterest || 0;
  const prepaymentInterest = prepaymentSchedule[prepaymentSchedule.length - 1]?.cumulativeInterest || 0;
  const interestSaved = baselineInterest - prepaymentInterest;
  const monthsSaved = baselineSchedule.length - prepaymentSchedule.length;

  // Calculate optimal strategy for modal
  const investmentPostTaxReturn = selectedInvestment.expectedReturn * (1 - selectedInvestment.taxRate / 100);
  const optimalStrategy = calculateOptimalPrepaymentStrategy(
    surplusAmount,
    loanInfo,
    financialHealth,
    outstandingPrincipal,
    investmentPostTaxReturn
  );

  const handleApplyOptimalStrategy = () => {
    const newPlan: PrepaymentPlan = {
      enableMonthly: optimalStrategy.monthlyPrepayment > 0,
      monthlyExtra: optimalStrategy.monthlyPrepayment,
      enableYearly: optimalStrategy.yearlyPrepayment > 0,
      yearlyAmount: optimalStrategy.yearlyPrepayment,
      yearlyMonth: 3,
      enableLumpsum: optimalStrategy.lumpsumPrepayment > 0,
      lumpsums: optimalStrategy.lumpsumPrepayment > 0 ? [{
        id: Date.now().toString(),
        amount: optimalStrategy.lumpsumPrepayment,
        month: 6,
        description: 'AI-recommended bonus prepayment'
      }] : []
    };
    setPrepaymentPlan(newPlan);
    setShowOptimalStrategyModal(false);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>🏠 Home Loan Optimizer</h1>
          <p>Smart prepayment vs investment analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* GitHub Buttons */}
          <a
            href="https://github.com/riteshkawadkar/home-loan-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>⭐</span>
            <span>Star</span>
          </a>
          <a
            href="https://github.com/riteshkawadkar/home-loan-optimizer/fork"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🍴</span>
            <span>Fork</span>
          </a>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="app-container">
        <div className="input-section">
          <LoanForm loanInfo={loanInfo} onChange={setLoanInfo} />
          
          <PrepaymentForm 
            prepaymentPlan={prepaymentPlan} 
            onChange={setPrepaymentPlan}
            surplusAmount={surplusAmount}
            onSurplusChange={setSurplusAmount}
          />
        </div>

        <div className="results-section">
          {/* Visual Dashboard - Always visible at top */}
          <VisualDashboard
            loanInfo={loanInfo}
            financialHealth={financialHealth}
            interestSaved={interestSaved}
            monthsSaved={monthsSaved}
          />
          
          {/* Tabbed Content */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tabs-container">
              <div className="tabs-header">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="tab-icon">📊</span>
                  <span>Overview</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  <span className="tab-icon">🤖</span>
                  <span>AI Insights</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  <span className="tab-icon">📈</span>
                  <span>Impact Analysis</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <span className="tab-icon">📋</span>
                  <span>Payment Schedule</span>
                </button>
              </div>
              
              <div className="tabs-content">
                {activeTab === 'overview' && (
                  <div className="tab-panel">
                    <RecommendationEngine 
                      loanInfo={loanInfo}
                      financialHealth={financialHealth}
                      surplusAmount={surplusAmount}
                      selectedInvestment={selectedInvestment}
                    />
                  </div>
                )}
                
                {activeTab === 'ai' && (
                  <div className="tab-panel">
                    <AIRecommendations
                      loanInfo={loanInfo}
                      financialHealth={financialHealth}
                      onFinancialHealthChange={setFinancialHealth}
                      prepaymentPlan={prepaymentPlan}
                      surplusAmount={surplusAmount}
                      selectedInvestment={selectedInvestment}
                      onShowOptimalStrategy={() => setShowOptimalStrategyModal(true)}
                    />
                  </div>
                )}
                
                {activeTab === 'analysis' && (
                  <div className="tab-panel">
                    <DetailedComparison
                      loanInfo={loanInfo}
                      prepaymentPlan={prepaymentPlan}
                      surplusAmount={surplusAmount}
                      selectedInvestment={selectedInvestment}
                    />
                  </div>
                )}
                
                {activeTab === 'schedule' && (
                  <div className="tab-panel">
                    <AmortizationTable
                      loanInfo={loanInfo}
                      prepaymentPlan={prepaymentPlan}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Strategy Modal - Rendered at root level */}
      <OptimalStrategyModal
        isOpen={showOptimalStrategyModal}
        onClose={() => setShowOptimalStrategyModal(false)}
        strategy={optimalStrategy}
        onApply={handleApplyOptimalStrategy}
        surplusAmount={surplusAmount}
      />
    </div>
  );
}

export default App;
