import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LoanInfo } from '../types';
import { 
  calculateMonthsElapsed,
  calculateRemainingTenure
} from '../utils/calculations';
import { FaFire, FaCalendarAlt } from 'react-icons/fa';
import { addMonths, format } from 'date-fns';

interface Props {
  loanInfo: LoanInfo;
  interestSaved: number;
  monthsSaved: number;
}

export default function VisualDashboard({ loanInfo, interestSaved, monthsSaved }: Props) {
  const monthsElapsed = calculateMonthsElapsed(loanInfo.startDate);
  const remainingTenure = calculateRemainingTenure(loanInfo.originalTenure, loanInfo.startDate);
  const progressPercent = (monthsElapsed / loanInfo.originalTenure) * 100;
  
  const startDate = new Date(loanInfo.startDate + '-01');
  const endDate = addMonths(startDate, loanInfo.originalTenure);

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



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ marginBottom: '24px' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Loan Timeline Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Background gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)'
          }} />

          <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '16px' }}>
            Loan Timeline
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#7f8c8d' }}>Started:</span>{' '}
              <strong style={{ color: '#2c3e50' }}>{format(startDate, 'MMM yyyy')}</strong>
            </div>
            
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#7f8c8d' }}>Original End:</span>{' '}
              <strong style={{ color: '#2c3e50' }}>{format(endDate, 'MMM yyyy')}</strong>
            </div>
            
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#7f8c8d' }}>Time Elapsed:</span>{' '}
              <strong style={{ color: '#2c3e50' }}>{Math.floor(monthsElapsed / 12)}y {monthsElapsed % 12}m</strong>
            </div>
            
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#7f8c8d' }}>Remaining:</span>{' '}
              <strong style={{ color: '#667eea' }}>
                {Math.floor(remainingTenure / 12)}y {remainingTenure % 12}m
              </strong>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Progress</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50' }}>{progressPercent.toFixed(1)}%</span>
            </div>
            <div style={{ 
              height: '5px', 
              background: '#ecf0f1', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: '3px'
                }} />
            </div>
          </div>
        </motion.div>

        {/* Prepayment Savings Widget */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Background gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(135deg, #f39c12, #f1c40f)'
          }} />

          <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '16px' }}>
            Prepayment Savings
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Interest Saved */}
            <div>
              <div style={{
                fontSize: '1.5rem',
                color: '#f39c12',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaFire />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '2px' }}>
                Interest Saved
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#2c3e50'
              }}>
                <CountUp
                  end={Math.abs(interestSaved)}
                  duration={2}
                  separator=","
                  prefix={interestSaved < 0 ? "-₹" : "₹"}
                  decimals={0}
                />
              </div>
            </div>

            {/* Time Saved */}
            <div>
              <div style={{
                fontSize: '1.5rem',
                color: '#9b59b6',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaCalendarAlt />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '2px' }}>
                Time Saved
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#2c3e50'
              }}>
                <CountUp
                  end={monthsSaved}
                  duration={2}
                  separator=","
                  suffix=" months"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
