import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { OptimalPrepaymentStrategy } from '../utils/aiAnalysis';
import { formatCurrency, formatLargeNumber } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  strategy: OptimalPrepaymentStrategy;
  onApply: () => void;
  surplusAmount: number;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
}

export default function OptimalStrategyModal({ isOpen, onClose, strategy, onApply, surplusAmount }: Props) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const hasSavings = strategy.expectedInterestSaved > 0;

  useEffect(() => {
    if (isOpen && hasSavings) {
      // Generate confetti
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];
      const newConfetti: Confetti[] = [];
      
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
          delay: Math.random() * 0.5
        });
      }
      
      setConfetti(newConfetti);
      
      // Clear confetti after animation
      const timer = setTimeout(() => setConfetti([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasSavings]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti Layer - Fixed to viewport */}
          {hasSavings && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 1001,
              overflow: 'hidden'
            }}>
              {confetti.map((piece) => (
                <motion.div
                  key={piece.id}
                  initial={{ 
                    left: `${piece.x}%`,
                    top: '-10%',
                    rotate: piece.rotation,
                    opacity: 1
                  }}
                  animate={{ 
                    top: '110%',
                    rotate: piece.rotation + 720,
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: piece.delay,
                    ease: 'easeIn'
                  }}
                  style={{
                    position: 'absolute',
                    width: `${piece.size}px`,
                    height: `${piece.size}px`,
                    background: piece.color,
                    borderRadius: piece.size > 8 ? '50%' : '2px'
                  }}
                />
              ))}
            </div>
          )}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              overflow: 'auto'
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>

              {/* Header with animation */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 32px',
                borderRadius: '20px 20px 0 0',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated circles background */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-10%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(40px)'
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '-30%',
                    right: '-5%',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(40px)'
                  }}
                />

                {/* Trophy animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{ 
                    type: 'spring',
                    damping: hasSavings ? 8 : 10,
                    stiffness: hasSavings ? 120 : 100,
                    delay: 0.2
                  }}
                  style={{ fontSize: '4rem', marginBottom: '16px' }}
                >
                  <motion.span
                    animate={hasSavings ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: 3,
                      ease: 'easeInOut',
                      delay: 0.5
                    }}
                  >
                    {hasSavings ? '🎉' : '🎯'}
                  </motion.span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ 
                    fontSize: '2rem', 
                    marginBottom: '12px',
                    fontWeight: 700
                  }}
                >
                  {hasSavings ? '🎊 Great News! You Can Save Big! 🎊' : 'Your Optimal Strategy is Ready!'}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ 
                    fontSize: '1rem', 
                    opacity: 0.95,
                    lineHeight: '1.5'
                  }}
                >
                  {hasSavings 
                    ? `Save ${formatLargeNumber(strategy.expectedInterestSaved)} in interest and become debt-free ${Math.floor(strategy.expectedMonthsSaved / 12)} years ${strategy.expectedMonthsSaved % 12} months earlier!`
                    : 'AI-powered analysis based on your financial profile'
                  }
                </motion.p>

                {/* Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    justifyContent: 'center',
                    marginTop: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ 
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {strategy.riskLevel}
                  </span>
                  <span style={{ 
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: strategy.confidence === 'high' ? 'rgba(46, 204, 113, 0.4)' : 
                               strategy.confidence === 'medium' ? 'rgba(241, 196, 15, 0.4)' : 
                               'rgba(231, 76, 60, 0.4)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {strategy.confidence} confidence
                  </span>
                </motion.div>
              </div>

              {/* Content */}
              <div style={{ padding: '32px' }}>
                {/* Rationale */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: '#2c3e50',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>💡</span>
                    <span>Why This Strategy?</span>
                  </div>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: '#34495e', 
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {strategy.rationale}
                  </p>
                </motion.div>

                {/* Strategy breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
                      Monthly Prepayment
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                      {formatCurrency(strategy.monthlyPrepayment)}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      {((strategy.monthlyPrepayment / surplusAmount) * 100).toFixed(0)}% of surplus
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    padding: '20px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
                      Yearly Prepayment
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                      {formatCurrency(strategy.yearlyPrepayment)}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      March (FY end)
                    </div>
                  </div>

                  {strategy.lumpsumPrepayment > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      padding: '20px',
                      borderRadius: '12px',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
                        Bonus Lumpsum
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        {formatCurrency(strategy.lumpsumPrepayment)}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        June (mid-year)
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                    padding: '20px',
                    borderRadius: '12px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
                      Total Annual
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                      {formatCurrency(strategy.totalAnnualPrepayment)}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      All prepayments
                    </div>
                  </div>
                </motion.div>

                {/* Expected benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                  }}
                >
                  <motion.div
                    animate={hasSavings ? {
                      boxShadow: [
                        '0 0 0 0 rgba(76, 175, 80, 0)',
                        '0 0 20px 5px rgba(76, 175, 80, 0.4)',
                        '0 0 0 0 rgba(76, 175, 80, 0)'
                      ]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    style={{
                      background: '#e8f5e9',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '2px solid #4caf50'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#2e7d32', marginBottom: '8px' }}>
                      💰 Interest Saved
                    </div>
                    <motion.div
                      animate={hasSavings ? { 
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        type: 'tween'
                      }}
                      style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1b5e20' }}
                    >
                      {formatLargeNumber(strategy.expectedInterestSaved)}
                    </motion.div>
                  </motion.div>

                  <motion.div
                    animate={hasSavings ? {
                      boxShadow: [
                        '0 0 0 0 rgba(33, 150, 243, 0)',
                        '0 0 20px 5px rgba(33, 150, 243, 0.4)',
                        '0 0 0 0 rgba(33, 150, 243, 0)'
                      ]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1
                    }}
                    style={{
                      background: '#e3f2fd',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '2px solid #2196f3'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#1565c0', marginBottom: '8px' }}>
                      ⏰ Time Saved
                    </div>
                    <motion.div
                      animate={hasSavings ? { 
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                        type: 'tween'
                      }}
                      style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0d47a1' }}
                    >
                      {Math.floor(strategy.expectedMonthsSaved / 12)}y {strategy.expectedMonthsSaved % 12}m
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Warning for emergency fund */}
                {strategy.monthlyPrepayment === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{
                      background: '#fff3e0',
                      border: '2px solid #ff9800',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'start', 
                      gap: '12px',
                      color: '#e65100'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                          Priority: Build Emergency Fund
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                          Focus on building your emergency fund to 6 months of expenses before starting prepayments.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    onClick={onApply}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>⚡</span>
                    <span>Apply This Strategy</span>
                  </button>

                  <button
                    onClick={onClose}
                    style={{
                      padding: '16px 32px',
                      background: 'white',
                      color: '#7f8c8d',
                      border: '2px solid #ecf0f1',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#bdc3c7';
                      e.currentTarget.style.color = '#2c3e50';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#ecf0f1';
                      e.currentTarget.style.color = '#7f8c8d';
                    }}
                  >
                    Maybe Later
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
