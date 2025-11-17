import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const trackFAQ = (question: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'faq_interaction', {
      event_category: 'Engagement',
      event_label: question
    });
  }
};

const faqs: FAQ[] = [
  {
    question: "How does the calculator work?",
    answer: "The calculator compares two scenarios: (1) Prepaying your home loan vs (2) Investing the same amount. It calculates interest saved from prepayment and potential returns from investments, considering tax implications, to help you make an informed decision."
  },
  {
    question: "Is my data safe and private?",
    answer: "Absolutely! All calculations happen in your browser. No data is sent to any server or stored anywhere. Your financial information never leaves your device. The tool is completely client-side and open source."
  },
  {
    question: "What are the tax benefits considered?",
    answer: "The calculator considers Section 80C (principal repayment up to ₹1.5L) and Section 24(b) (interest payment up to ₹2L) deductions for home loans. It also factors in capital gains tax on investments based on the investment type you select."
  },
  {
    question: "Should I always prepay if the loan rate is higher?",
    answer: "Not necessarily. While prepaying gives guaranteed returns equal to your loan rate, investing might offer higher returns with some risk. Consider factors like emergency fund, liquidity needs, loan stage, and your risk tolerance. The AI recommendations help balance these factors."
  },
  {
    question: "Can I use this for other types of loans?",
    answer: "While designed for home loans, the calculator can work for any loan with fixed EMI. However, tax benefits (80C, 24b) are specific to home loans, so those calculations won't apply to personal or car loans."
  },
  {
    question: "What if I've already made some prepayments?",
    answer: "You can edit the Outstanding Principal field to enter your current loan balance. Click the 'Edit' button next to the auto-calculated value and input your actual outstanding amount from your loan statement."
  },
  {
    question: "How accurate are the AI recommendations?",
    answer: "The AI analyzes 7+ factors including emergency fund status, loan stage, interest rate differential, and financial health. Recommendations are mathematically sound but should be considered alongside your personal circumstances, risk tolerance, and life goals."
  },
  {
    question: "Can I save or export my analysis?",
    answer: "Currently, the tool doesn't save data (for privacy). You can take screenshots or note down the recommendations. We're considering adding a PDF export feature - share your feedback if this would be useful!"
  }
];

export default function FAQSection() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    const isExpanding = expandedFAQ !== index;
    setExpandedFAQ(expandedFAQ === index ? null : index);
    
    if (isExpanding) {
      trackFAQ(faqs[index].question);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '16px' }}>❓ Frequently Asked Questions</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #e0e6ed',
              borderRadius: '8px',
              overflow: 'hidden',
              background: expandedFAQ === index ? '#f8f9fa' : 'white'
            }}
          >
            <div
              onClick={() => toggleFAQ(index)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = expandedFAQ === index ? '#f8f9fa' : 'white';
              }}
            >
              <h3 style={{ 
                fontSize: '1rem', 
                margin: 0, 
                color: '#2c3e50',
                fontWeight: 600
              }}>
                {faq.question}
              </h3>
              <span style={{ 
                fontSize: '1.2rem', 
                color: '#667eea',
                transition: 'transform 0.3s',
                transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
            
            {expandedFAQ === index && (
              <div style={{ 
                padding: '0 16px 16px 16px',
                fontSize: '0.95rem',
                color: '#34495e',
                lineHeight: '1.6'
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f0f3ff',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#667eea', fontSize: '0.95rem' }}>
          💡 Have more questions? <a 
            href="https://github.com/riteshkawadkar/home-loan-optimizer/discussions" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#667eea', fontWeight: 600, textDecoration: 'underline' }}
          >
            Ask on GitHub Discussions
          </a>
        </p>
      </div>
    </div>
  );
}
