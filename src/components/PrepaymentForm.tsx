import { PrepaymentPlan, Lumpsum } from '../types';

interface Props {
  prepaymentPlan: PrepaymentPlan;
  onChange: (plan: PrepaymentPlan) => void;
  surplusAmount: number;
  onSurplusChange: (amount: number) => void;
}

export default function PrepaymentForm({ prepaymentPlan, onChange, surplusAmount, onSurplusChange }: Props) {
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
      
      {/* Monthly Surplus - Highlighted at top */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', 
        borderRadius: '8px',
        border: '2px solid #4caf50',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2e7d32', margin: 0 }}>
            Monthly Surplus for Investment
          </label>
        </div>
        <input
          type="text"
          value={formatIndianNumber(surplusAmount)}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            onSurplusChange(Number(value) || 0);
          }}
          placeholder="₹10,000"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #4caf50',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'white'
          }}
        />
        <small style={{ color: '#2e7d32', fontSize: '0.85rem', display: 'block', marginTop: '6px' }}>
          💡 Amount available for investment comparison
        </small>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
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

        <div className="form-group" style={{ marginBottom: 0 }}>
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
      </div>

      {prepaymentPlan.enableMonthly && (
        <div className="form-group">
          <label>Monthly Extra Payment</label>
          <input
            type="text"
            value={formatIndianNumber(prepaymentPlan.monthlyExtra)}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onChange({ ...prepaymentPlan, monthlyExtra: Number(value) || 0 });
            }}
            placeholder="₹5,000"
          />
          <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
            Extra every month
          </small>
        </div>
      )}

      {prepaymentPlan.enableYearly && (
        <>
          <div className="form-group">
            <label>Yearly Payment Amount</label>
            <input
              type="text"
              value={formatIndianNumber(prepaymentPlan.yearlyAmount)}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                onChange({ ...prepaymentPlan, yearlyAmount: Number(value) || 0 });
              }}
              placeholder="₹1,00,000"
            />
            <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
              Once per year
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
                        type="text"
                        value={formatIndianNumber(lumpsum.amount)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          updateLumpsum(lumpsum.id, 'amount', Number(value) || 0);
                        }}
                        placeholder="₹50,000"
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
    </div>
  );
}
