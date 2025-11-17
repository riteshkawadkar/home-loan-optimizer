import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LoanInfo, FinancialHealth } from '../types';
import { 
  calculateOutstandingPrincipal, 
  calculateMonthsElapsed
} from '../utils/calculations';
import { FaChartLine, FaFire, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

interface Props {
  loanInfo: LoanInfo;
  financialHealth: FinancialHealth;
  interestSaved: number;
  monthsSaved: number;
}

export default function VisualDashboard({ loanInfo, financialHealth, interestSaved, monthsSaved }: Props) {
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const outstandingPrincipal = calculateOutstandingPrincipal(
    loanInfo.originalAmount,
    loanInfo.currentEMI,
    loanInfo.interestRate,
    monthsElapsed
  );

  const totalAssets = financialHealth.emergencyFund + financialHealth.liquidSavings + 
                     financialHealth.totalInvestments;
  
  const totalLiabilities = outstandingPrincipal + financialHealth.otherLoans + 
                          financialHealth.creditCardDebt;
  
  const netWorth = totalAssets - totalLiabilities;
  const progressPercent = (monthsElapsed / loanInfo.originalTenure) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const cards = [
    {
      icon: <FaChartLine />,
      title: "Net Worth",
      value: netWorth,
      format: "currency",
      color: netWorth > 0 ? "#27ae60" : "#e74c3c",
      gradient: "linear-gradient(135deg, #27ae60, #2ecc71)",
      suffix: ""
    },
    {
      icon: <FaTrophy />,
      title: "Loan Progress",
      value: progressPercent,
      format: "percentage",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
      suffix: "%"
    },
    {
      icon: <FaFire />,
      title: "Interest Saved",
      value: interestSaved,
      format: "currency",
      color: "#f39c12",
      gradient: "linear-gradient(135deg, #f39c12, #f1c40f)",
      suffix: ""
    },
    {
      icon: <FaCalendarAlt />,
      title: "Time Saved",
      value: monthsSaved,
      format: "number",
      color: "#9b59b6",
      gradient: "linear-gradient(135deg, #9b59b6, #8e44ad)",
      suffix: " months"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ marginBottom: '24px' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            {/* Background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: card.gradient
            }} />

            {/* Icon */}
            <div style={{
              fontSize: '2rem',
              color: card.color,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {card.icon}
              <span style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 500 }}>
                {card.title}
              </span>
            </div>

            {/* Value */}
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              {card.format === "currency" ? (
                <>
                  <CountUp
                    end={Math.abs(card.value)}
                    duration={2}
                    separator=","
                    prefix={card.value < 0 ? "-₹" : "₹"}
                    decimals={0}
                  />
                </>
              ) : card.format === "percentage" ? (
                <CountUp
                  end={card.value}
                  duration={2}
                  decimals={1}
                  suffix={card.suffix}
                />
              ) : card.format === "decimal" ? (
                <CountUp
                  end={card.value}
                  duration={2}
                  decimals={1}
                  suffix={card.suffix}
                />
              ) : (
                <CountUp
                  end={card.value}
                  duration={2}
                  separator=","
                  suffix={card.suffix}
                />
              )}
            </div>

            {/* Progress indicator for percentage cards */}
            {card.format === "percentage" && (
              <div style={{
                width: '100%',
                height: '6px',
                background: '#ecf0f1',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '12px'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(card.value, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: card.gradient,
                    borderRadius: '3px'
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>


    </motion.div>
  );
}
