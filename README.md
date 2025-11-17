# 🏠 Home Loan Optimizer

An advanced financial planning tool that helps homeowners make data-driven decisions about loan prepayment vs investment strategies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

## ✨ Features

### 🎯 Smart Loan Analysis
- **Outstanding Principal Calculation** - Auto-calculates based on loan start date and EMI
- **Multiple Prepayment Types** - Monthly, yearly, and lumpsum prepayments
- **Interest Savings Calculator** - See exactly how much you'll save
- **Tenure Reduction** - Know how many months/years you'll save

### 🤖 AI-Powered Recommendations
- **Optimal Prepayment Strategy** - AI suggests the best mix of monthly, yearly, and lumpsum prepayments
- **Risk-Based Analysis** - Conservative, balanced, or aggressive strategies
- **Confidence Scoring** - Know how reliable the recommendations are
- **Personalized Insights** - 8+ factors analyzed for tailored advice

### 📊 Visual Dashboard
- **4 Key Metrics** - Net worth, loan progress, interest saved, time saved
- **Animated Cards** - Smooth transitions and count-up animations
- **Real-time Updates** - See changes instantly as you adjust inputs

### 🎨 Modern UI/UX
- **Dark/Light Theme** - Toggle between themes with persistence
- **Tabbed Interface** - Overview, AI Insights, Impact Analysis, Payment Schedule
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Celebration Effects** - Confetti animation when AI finds savings!

### 💼 Optional Financial Profile
- **Progressive Disclosure** - Start simple, add details for deeper insights
- **2-Column Layout** - Efficient space utilization
- **Collapsible Sections** - Focus on what matters
- **Smart Defaults** - Pre-filled with reasonable values

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/home-loan-optimizer.git

# Navigate to project directory
cd home-loan-optimizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Basic Flow

1. **Enter Loan Details**
   - Start date, original amount, tenure
   - Current EMI and interest rate
   - Prepayment penalty (if any)

2. **Set Prepayment Plan**
   - Enable monthly extra payments
   - Add yearly prepayments
   - Schedule lumpsum payments

3. **View AI Insights**
   - Click "View Your Optimal Strategy"
   - See AI-recommended prepayment plan
   - Apply strategy with one click

4. **Optional: Add Financial Profile**
   - Provide income, expenses, investments
   - Get personalized recommendations
   - See detailed financial health analysis

### Advanced Features

**Scenario Comparison**
- Compare 6 pre-configured scenarios
- See net worth projections
- Understand risk vs return tradeoffs

**Amortization Schedule**
- Month-by-month payment breakdown
- Track principal vs interest
- See impact of prepayments

**Tax Optimization**
- 80C deduction tracking
- 24(b) interest deduction
- Tax-adjusted investment returns

## 🛠️ Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.4
- **Build Tool**: Vite 5.x
- **Styling**: CSS (custom, theme-aware)
- **Charts**: Recharts 2.12
- **Animations**: Framer Motion
- **Date Handling**: date-fns 3.0

## 📁 Project Structure

```
home-loan-optimizer/
├── src/
│   ├── components/          # React components
│   │   ├── LoanForm.tsx
│   │   ├── PrepaymentForm.tsx
│   │   ├── FinancialHealthForm.tsx
│   │   ├── AIRecommendations.tsx
│   │   ├── OptimalStrategyModal.tsx
│   │   ├── VisualDashboard.tsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── ThemeContext.tsx
│   ├── utils/               # Utility functions
│   │   ├── calculations.ts
│   │   └── aiAnalysis.ts
│   ├── types.ts             # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   ├── App.css              # Global styles
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Key Algorithms

### Outstanding Principal Calculation
```typescript
// Calculates remaining loan balance based on:
// - Original amount
// - Monthly EMI
// - Interest rate
// - Months elapsed
```

### AI Strategy Optimization
```typescript
// Analyzes:
// - Monthly surplus
// - Loan rate vs investment returns
// - Emergency fund status
// - Loan stage (early/mid/final)
// - Age and retirement proximity
// Returns optimal prepayment mix
```

### Amortization Schedule
```typescript
// Generates month-by-month breakdown with:
// - Regular EMI payments
// - Extra monthly prepayments
// - Yearly prepayments
// - Lumpsum prepayments
// - Interest vs principal split
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Code Style**
   - Use TypeScript strict mode
   - Follow React hooks best practices
   - Keep components small and focused
   - Add proper TypeScript interfaces

2. **Commit Messages**
   - Use conventional commits format
   - Be descriptive and clear

3. **Testing**
   - Test calculations thoroughly
   - Verify UI responsiveness
   - Check dark/light theme compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for better home loan planning tools
- Built with modern React and TypeScript best practices
- UI/UX influenced by contemporary fintech applications

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Export reports to PDF
- [ ] Save/load scenarios
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Integration with bank APIs
- [ ] Comparison with peers/benchmarks
- [ ] Email reminders for prepayments
- [ ] Historical tracking and analytics

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

Made with ❤️ for better financial planning
