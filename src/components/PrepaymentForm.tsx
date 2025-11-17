import { PrepaymentPlan, Lumpsum } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  prepaymentPlan: PrepaymentPlan;
  onChange: (plan: PrepaymentPlan) => void;
  surplusAmount: number;
  onSurplusChange: (amount: number) => void;
}

export default function PrepaymentForm({ prepaymentPlan, onChange, surplusAmount, onSurplusChange }: Props) {
  const hasAnyPrepayment = prepaymentPlan.enableMonthly || prepaymentPlan.enableYearly || prepaymentPlan.enableLumpsum;

  const addLumpsum = () => {
    const newLumpsum: Lumpsum = {
      id: Date.now().toString(),
      month: 1,
      amount: 50000,
      description: 'Bonus/Extra payment'
    };
    onChange({ 
      ...prepaymentPlan, 
      lumpsums: [...prepaymentPlan.lumpsums, newLumpsum] 
    });
  };

  const updateLumpsum = (id: string, field: keyof Lumpsum, value: string | number) => {
    onChange({
      ...prepaymentPlan,
      lumpsums: prepaymentPlan.lumpsums.map(l => 
        l.id === id ? { ...l, [field]: value } : l
      )
    });
  };

  const removeLumpsum = (id: string) => {
    onChange({
      ...prepaymentPlan,
      lumpsums: prepaymentPlan.lumpsums.filter(l => l.id !== id)
    });
  };

  return (
    <div className="card">
      <h2>💸 Prepayment Strategy</h2>
      
      <div style={{ 
        marginBottom: '16px', 
        padding: '12px', 
        background: '#f0f3ff', 
        borderRadius: '6px',
        fontSize: '0.9rem',
        color: '#667eea'
      }}>
        💡 You can enable multiple prepayment types together
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={prepaymentPlan.enableMonthly}
            onChange={(e) => onChange({ ...prepaymentPlan, enableMonthly: e.target.checked })}
            style={{ marginRight: '8px', width: 'auto', cursor: 'pointer' }}
          />
          <span>Monthly Extra Payment</span>
        </label>
      </div>

      {prepaymentPlan.enableMonthly && (
        <div className="form-group">
          <label>Monthly Extra Payment</label>
          <input
            type="number"
            value={prepaymentPlan.monthlyExtra}
            onChange={(e) => onChange({ ...prepaymentPlan, monthlyExtra: Number(e.target.value) })}
          />
          <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
            {formatCurrency(prepaymentPlan.monthlyExtra)} extra every month
          </small>
        </div>
      )}

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={prepaymentPlan.enableYearly}
            onChange={(e) => onChange({ ...prepaymentPlan, enableYearly: e.target.checked })}
            style={{ marginRight: '8px', width: 'auto', cursor: 'pointer' }}
          />
          <span>Yearly Payment</span>
        </label>
      </div>

      {prepaymentPlan.enableYearly && (
        <>
          <div className="form-group">
            <label>Yearly Payment Amount</label>
            <input
              type="number"
              value={prepaymentPlan.yearlyAmount}
              onChange={(e) => onChange({ ...prepaymentPlan, yearlyAmount: Number(e.target.value) })}
            />
            <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
              {formatCurrency(prepaymentPlan.yearlyAmount)} once per year
            </small>
          </div>
          <div className="form-group">
            <label>Payment Month</label>
            <select
              value={prepaymentPlan.yearlyMonth}
              onChange={(e) => onChange({ ...prepaymentPlan, yearlyMonth: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e0e6ed',
                borderRadius: '6px',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={prepaymentPlan.enableLumpsum}
            onChange={(e) => onChange({ ...prepaymentPlan, enableLumpsum: e.target.checked })}
            style={{ marginRight: '8px', width: 'auto', cursor: 'pointer' }}
          />
          <span>One-time Lumpsum(s)</span>
        </label>
      </div>

      {prepaymentPlan.enableLumpsum && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ margin: 0 }}>Lumpsum Payments</label>
            <button
              onClick={addLumpsum}
              style={{
                padding: '6px 12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              + Add
            </button>
          </div>
          
          {prepaymentPlan.lumpsums.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              textAlign: 'center',
              color: '#7f8c8d',
              fontSize: '0.9rem'
            }}>
              No lumpsum payments added. Click "+ Add" to add one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prepaymentPlan.lumpsums.map(lumpsum => (
                <div key={lumpsum.id} style={{ 
                  padding: '12px', 
                  background: '#f8f9fa', 
                  borderRadius: '6px',
                  border: '1px solid #e0e6ed'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Month #</label>
                      <input
                        type="number"
                        value={lumpsum.month}
                        onChange={(e) => updateLumpsum(lumpsum.id, 'month', Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #e0e6ed',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Amount</label>
                      <input
                        type="number"
                        value={lumpsum.amount}
                        onChange={(e) => updateLumpsum(lumpsum.id, 'amount', Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #e0e6ed',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Description</label>
                    <input
                      type="text"
                      value={lumpsum.description}
                      onChange={(e) => updateLumpsum(lumpsum.id, 'description', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #e0e6ed',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeLumpsum(lumpsum.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasAnyPrepayment && (
        <div style={{ 
          marginTop: '16px',
          padding: '16px', 
          background: '#fff3cd', 
          borderRadius: '6px',
          border: '1px solid #ffc107',
          fontSize: '0.9rem',
          color: '#856404'
        }}>
          ⚠️ No prepayment selected. Enable at least one option above to see prepayment impact.
        </div>
      )}

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Monthly Surplus for Investment</label>
        <input
          type="number"
          value={surplusAmount}
          onChange={(e) => onSurplusChange(Number(e.target.value))}
        />
        <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
          Amount available for investment comparison
        </small>
      </div>
    </div>
  );
}
