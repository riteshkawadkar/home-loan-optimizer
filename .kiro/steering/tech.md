# Technology Stack

## Build System

Vite 5.x - Fast, modern build tool with HMR

## Tech Stack

- Language: TypeScript 5.4+
- Framework: React 18.3
- Runtime: Node.js 18+
- Styling: CSS (custom)
- Charts: Recharts 2.12
- Date Handling: date-fns 3.0

## Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "recharts": "^2.12.0",
  "date-fns": "^3.0.0"
}
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Guidelines

- Use TypeScript strict mode
- Follow React hooks best practices
- Keep components small and focused
- Use proper TypeScript interfaces for all data structures
- Format currency as INR (₹)
- All financial calculations use precise decimal arithmetic
