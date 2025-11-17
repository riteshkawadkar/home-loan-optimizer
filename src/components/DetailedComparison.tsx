import { LoanInfo, PrepaymentPlan, InvestmentOption } from '../types';
import { 
  generateAmortizationSchedule, 
  calculateOutstandingPrincipal, 
  calculateMonthsElapsed,
  calculateInvestmentReturns,
  formatCurrency,
  formatLargeNumber
} from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  loanInfo: LoanInfo;
  prepaymentPlan: PrepaymentPlan;
  surplusAmount: number;
  selectedInvestment: InvestmentOption;
}

export default function DetailedComparison({ loanInfo, prepaymentPlan, selectedInvestment }: Props) {
  const startDate = new Date();
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );

  // Scenario 1: No prepayment (baseline)
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
  const baselineInterest = baselineSchedule[baselineSchedule.length - 1]?.cumulativeInterest || 0;
  const baselineMonths = baselineSchedule.length;

  // Scenario 2: With current prepayment plan
  const prepaymentSchedule = generateAmortizationSchedule(loanInfo, prepaymentPlan, startDate, outstandingPrincipal);
  const prepaymentInterest = prepaymentSchedule[prepaymentSchedule.length - 1]?.cumulativeInterest || 0;
  const prepaymentMonths = prepaymentSchedule.length;

  // Calculate total prepayments
  const totalMonthlyPrepayment = prepaymentPlan.enableMonthly 
    ? prepaymentPlan.monthlyExtra * prepaymentMonths 
    : 0;
  const totalYearlyPrepayment = prepaymentPlan.enableYearly 
    ? prepaymentPlan.yearlyAmount * Math.floor(prepaymentMonths / 12)
    : 0;
  const totalLumpsumPrepayment = prepaymentPlan.enableLumpsum
    ? prepaymentPlan.lumpsums.reduce((sum, l) => sum + l.amount, 0)
    : 0;
  const totalPrepayment = totalMonthlyPrepayment + totalYearlyPrepayment + totalLumpsumPrepayment;

  // Interest saved
  const interestSaved = baselineInterest - prepaymentInterest;
  const monthsSaved = baselineMonths - prepaymentMonths;

  // Calculate interest saved by each prepayment type
  // We need to run scenarios with only one type enabled at a time
  const getInterestSavedByType = (enableType: 'monthly' | 'yearly' | 'lumpsum') => {
    const singleTypePlan: PrepaymentPlan = {
      enableMonthly: enableType === 'monthly' && prepaymentPlan.enableMonthly,
      monthlyExtra: prepaymentPlan.monthlyExtra,
      enableYearly: enableType === 'yearly' && prepaymentPlan.enableYearly,
      yearlyAmount: prepaymentPlan.yearlyAmount,
      yearlyMonth: prepaymentPlan.yearlyMonth,
      enableLumpsum: enableType === 'lumpsum' && prepaymentPlan.enableLumpsum,
      lumpsums: prepaymentPlan.lumpsums
    };
    
    const schedule = generateAmortizationSchedule(loanInfo, singleTypePlan, startDate, outstandingPrincipal);
    const interest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
    return baselineInterest - interest;
  };

  const monthlyInterestSaved = prepaymentPlan.enableMonthly ? getInterestSavedByType('monthly') : 0;
  const yearlyInterestSaved = prepaymentPlan.enableYearly ? getInterestSavedByType('yearly') : 0;
  const lumpsumInterestSaved = prepaymentPlan.enableLumpsum ? getInterestSavedByType('lumpsum') : 0;

  // Investment scenarios
  const postTaxRate = selectedInvestment.expectedReturn * (1 - selectedInvestment.taxRate / 100);
  
  // If prepayment amount was invested instead
  const monthlyPrepaymentInvested = prepaymentPlan.enableMonthly
    ? calculateInvestmentReturns(prepaymentPlan.monthlyExtra, postTaxRate, prepaymentMonths)
    : 0;
  
  const yearlyPrepaymentInvested = prepaymentPlan.enableYearly
    ? calculateInvestmentReturns(0, postTaxRate, prepaymentMonths, 
        Array.from({ length: Math.floor(prepaymentMonths / 12) }, (_, i) => ({
          month: (i + 1) * 12,
          amount: prepaymentPlan.yearlyAmount
        })))
    : 0;

  const lumpsumPrepaymentInvested = prepaymentPlan.enableLumpsum
    ? calculateInvestmentReturns(0, postTaxRate, prepaymentMonths, prepaymentPlan.lumpsums)
    : 0;

  // Calculate net benefit correctly
  // Option 1: Prepay - you save interest
  // Option 2: Invest - you gain returns
  // Net benefit = Interest saved - Investment gains (from prepayment amounts)
  
  const totalInvestmentGain = (monthlyPrepaymentInvested - totalMonthlyPrepayment) + 
                              (yearlyPrepaymentInvested - totalYearlyPrepayment) + 
                              (lumpsumPrepaymentInvested - totalLumpsumPrepayment);
  
  const netBenefit = interestSaved - totalInvestmentGain;

  // Prepare chart data - sample every 12 months for readability
  const chartData = baselineSchedule
    .filter((_, idx) => idx % 12 === 0 || idx === baselineSchedule.length - 1)
    .map((row, idx) => {
      const prepayRow = prepaymentSchedule[idx * 12] || prepaymentSchedule[prepaymentSchedule.length - 1];
      return {
        month: row.month,
        year: Math.floor(row.month / 12),
        baselineBalance: row.balance,
        prepaymentBalance: prepayRow?.balance || 0,
        baselineInterest: row.cumulativeInterest,
        prepaymentInterest: prepayRow?.cumulativeInterest || prepaymentInterest
      };
    });



  return (
    <div className="card">
      <h2>📊 Detailed Impact Analysis</h2>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ padding: '16px', background: '#e8f8f0', borderRadius: '8px', border: '2px solid #27ae60' }}>
          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>Interest Saved</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#27ae60' }}>
            {formatLargeNumber(interestSaved)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
            {((interestSaved / baselineInterest) * 100).toFixed(1)}% reduction
          </div>
        </div>

        <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '8px', border: '2px solid #2196f3' }}>
          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>Time Saved</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2196f3' }}>
            {Math.floor(monthsSaved / 12)}y {monthsSaved % 12}m
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
            Loan free {monthsSaved} months earlier
          </div>
        </div>

        <div style={{ padding: '16px', background: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800' }}>
          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Prepaid</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ff9800' }}>
            {formatLargeNumber(totalPrepayment)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
            Extra payments made
          </div>
        </div>

        <div style={{ padding: '16px', background: netBenefit > 0 ? '#e8f8f0' : '#fff3e0', borderRadius: '8px', border: `2px solid ${netBenefit > 0 ? '#27ae60' : '#ff9800'}` }}>
          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>Net Benefit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: netBenefit > 0 ? '#27ae60' : '#ff9800' }}>
            {formatLargeNumber(Math.abs(netBenefit))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
            {netBenefit > 0 ? 'Prepaying is better' : 'Investing is better'}
          </div>
        </div>
      </div>

      {/* Prepayment Type Breakdown */}
      {(prepaymentPlan.enableMonthly || prepaymentPlan.enableYearly || prepaymentPlan.enableLumpsum) && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>💰 Prepayment Breakdown</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            
            {prepaymentPlan.enableMonthly && (
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e6ed' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2c3e50', marginBottom: '8px' }}>
                    📅 Monthly Extra Payment
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '12px' }}>
                    {formatCurrency(prepaymentPlan.monthlyExtra)} × {prepaymentMonths} months
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e6ed' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Prepaid</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
                        {formatLargeNumber(totalMonthlyPrepayment)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e8f8f0', borderRadius: '6px', border: '1px solid #27ae60' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Interest Saved</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#27ae60' }}>
                        {formatLargeNumber(monthlyInterestSaved)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #2196f3' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>If Invested</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2196f3' }}>
                        {formatLargeNumber(monthlyPrepaymentInvested)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px', 
                    background: monthlyInterestSaved > (monthlyPrepaymentInvested - totalMonthlyPrepayment) ? '#e8f8f0' : '#fff3e0',
                    borderRadius: '6px',
                    border: `2px solid ${monthlyInterestSaved > (monthlyPrepaymentInvested - totalMonthlyPrepayment) ? '#27ae60' : '#ff9800'}`,
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {monthlyInterestSaved > (monthlyPrepaymentInvested - totalMonthlyPrepayment) 
                        ? '✅ Prepaying is Better'
                        : '⚠️ Investing is Better'
                      }
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                      Interest saved: {formatLargeNumber(monthlyInterestSaved)} vs Investment gain: {formatLargeNumber(monthlyPrepaymentInvested - totalMonthlyPrepayment)}
                      <br />
                      <strong>Net benefit of prepaying: {formatLargeNumber(monthlyInterestSaved - (monthlyPrepaymentInvested - totalMonthlyPrepayment))}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {prepaymentPlan.enableYearly && (
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e6ed' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2c3e50', marginBottom: '8px' }}>
                    📆 Yearly Payment
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '12px' }}>
                    {formatCurrency(prepaymentPlan.yearlyAmount)} × {Math.floor(prepaymentMonths / 12)} years
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e6ed' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Prepaid</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
                        {formatLargeNumber(totalYearlyPrepayment)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e8f8f0', borderRadius: '6px', border: '1px solid #27ae60' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Interest Saved</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#27ae60' }}>
                        {formatLargeNumber(yearlyInterestSaved)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #2196f3' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>If Invested</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2196f3' }}>
                        {formatLargeNumber(yearlyPrepaymentInvested)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px', 
                    background: yearlyInterestSaved > (yearlyPrepaymentInvested - totalYearlyPrepayment) ? '#e8f8f0' : '#fff3e0',
                    borderRadius: '6px',
                    border: `2px solid ${yearlyInterestSaved > (yearlyPrepaymentInvested - totalYearlyPrepayment) ? '#27ae60' : '#ff9800'}`,
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {yearlyInterestSaved > (yearlyPrepaymentInvested - totalYearlyPrepayment) 
                        ? '✅ Prepaying is Better'
                        : '⚠️ Investing is Better'
                      }
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                      Interest saved: {formatLargeNumber(yearlyInterestSaved)} vs Investment gain: {formatLargeNumber(yearlyPrepaymentInvested - totalYearlyPrepayment)}
                      <br />
                      <strong>Net benefit of prepaying: {formatLargeNumber(yearlyInterestSaved - (yearlyPrepaymentInvested - totalYearlyPrepayment))}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {prepaymentPlan.enableLumpsum && prepaymentPlan.lumpsums.length > 0 && (
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e6ed' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2c3e50', marginBottom: '8px' }}>
                    💵 Lumpsum Payments
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '12px' }}>
                    {prepaymentPlan.lumpsums.length} payment(s): {prepaymentPlan.lumpsums.map(l => `Month ${l.month}`).join(', ')}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e0e6ed' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Total Prepaid</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
                        {formatLargeNumber(totalLumpsumPrepayment)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e8f8f0', borderRadius: '6px', border: '1px solid #27ae60' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>Interest Saved</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#27ae60' }}>
                        {formatLargeNumber(lumpsumInterestSaved)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #2196f3' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '4px' }}>If Invested</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2196f3' }}>
                        {formatLargeNumber(lumpsumPrepaymentInvested)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px', 
                    background: lumpsumInterestSaved > (lumpsumPrepaymentInvested - totalLumpsumPrepayment) ? '#e8f8f0' : '#fff3e0',
                    borderRadius: '6px',
                    border: `2px solid ${lumpsumInterestSaved > (lumpsumPrepaymentInvested - totalLumpsumPrepayment) ? '#27ae60' : '#ff9800'}`,
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {lumpsumInterestSaved > (lumpsumPrepaymentInvested - totalLumpsumPrepayment) 
                        ? '✅ Prepaying is Better'
                        : '⚠️ Investing is Better'
                      }
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                      Interest saved: {formatLargeNumber(lumpsumInterestSaved)} vs Investment gain: {formatLargeNumber(lumpsumPrepaymentInvested - totalLumpsumPrepayment)}
                      <br />
                      <strong>Net benefit of prepaying: {formatLargeNumber(lumpsumInterestSaved - (lumpsumPrepaymentInvested - totalLumpsumPrepayment))}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Balance Over Time Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>📉 Loan Balance Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
              label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="baselineBalance" 
              stroke="#e74c3c" 
              strokeWidth={2}
              name="Without Prepayment"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="prepaymentBalance" 
              stroke="#27ae60" 
              strokeWidth={2}
              name="With Prepayment"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7f8c8d', marginTop: '8px' }}>
          Green line shows faster debt reduction with prepayments
        </div>
      </div>

      {/* Cumulative Interest Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>💸 Cumulative Interest Paid</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
              label={{ value: 'Interest', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="baselineInterest" 
              stroke="#e74c3c" 
              strokeWidth={2}
              name="Without Prepayment"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="prepaymentInterest" 
              stroke="#27ae60" 
              strokeWidth={2}
              name="With Prepayment"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7f8c8d', marginTop: '8px' }}>
          Lower green line means less interest paid overall
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>⚖️ Side-by-Side Comparison</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '8px', border: '2px solid #e74c3c' }}>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px' }}>Without Prepayment</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#e74c3c', marginBottom: '16px' }}>
              {formatLargeNumber(baselineInterest)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              Interest paid over {Math.floor(baselineMonths / 12)}y {baselineMonths % 12}m
            </div>
          </div>

          <div style={{ padding: '20px', background: '#e8f8f0', borderRadius: '8px', border: '2px solid #27ae60' }}>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px' }}>With Prepayment</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#27ae60', marginBottom: '16px' }}>
              {formatLargeNumber(prepaymentInterest)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              Interest paid over {Math.floor(prepaymentMonths / 12)}y {prepaymentMonths % 12}m
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        background: netBenefit > 0 ? '#e8f8f0' : '#fff3e0', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#2c3e50',
        border: `2px solid ${netBenefit > 0 ? '#27ae60' : '#ff9800'}`
      }}>
        <strong>💡 Key Insight:</strong> By prepaying {formatLargeNumber(totalPrepayment)}, you save {formatLargeNumber(interestSaved)} in interest 
        and become debt-free {Math.floor(monthsSaved / 12)} years {monthsSaved % 12} months earlier.
        <br /><br />
        {netBenefit > 0 
          ? `✅ Prepaying is the better choice! You gain ${formatLargeNumber(netBenefit)} more by prepaying than if you had invested the same amount (which would have yielded ${formatLargeNumber(totalInvestmentGain)} in gains).`
          : `⚠️ Investing would be better! If you invested the prepayment amount instead, you'd gain ${formatLargeNumber(totalInvestmentGain)} from investments vs ${formatLargeNumber(interestSaved)} saved in interest - a difference of ${formatLargeNumber(Math.abs(netBenefit))}.`
        }
        <br /><br />
        <strong>The Math:</strong> Interest saved ({formatLargeNumber(interestSaved)}) {netBenefit > 0 ? '>' : '<'} Investment gains ({formatLargeNumber(totalInvestmentGain)}) = Net benefit of {formatLargeNumber(Math.abs(netBenefit))} {netBenefit > 0 ? 'for prepaying' : 'for investing'}.
      </div>
    </div>
  );
}
