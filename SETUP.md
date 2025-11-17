# Setup Guide

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/home-loan-optimizer.git
cd home-loan-optimizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Publishing to GitHub

### 1. Create a New Repository on GitHub

1. Go to https://github.com/new
2. Name it `home-loan-optimizer`
3. Don't initialize with README (we already have one)
4. Click "Create repository"

### 2. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Home Loan Optimizer v1.0.0"
```

### 3. Connect to GitHub

```bash
git remote add origin https://github.com/yourusername/home-loan-optimizer.git
git branch -M main
git push -u origin main
```

### 4. Update Repository URLs

Replace `yourusername` in these files with your actual GitHub username:
- `README.md`
- `package.json`
- `CHANGELOG.md`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploying

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. Add to vite.config.ts:
```typescript
export default defineConfig({
  base: '/home-loan-optimizer/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

## Environment Variables

Currently, this project doesn't require any environment variables. If you add API integrations in the future, create a `.env` file:

```env
VITE_API_KEY=your_api_key_here
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:
```bash
npm run dev -- --port 3000
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

Run type checking:
```bash
npx tsc --noEmit
```

## Next Steps

1. ⭐ Star the repository
2. 📝 Update README with your information
3. 🎨 Customize branding/colors
4. 🚀 Deploy to your preferred platform
5. 📢 Share with the community!

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed information

Happy coding! 🎉
