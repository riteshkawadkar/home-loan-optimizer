# Deployment Guide

This guide covers deploying Home Loan Optimizer to various free hosting platforms.

---

## 🚀 GitHub Pages (Recommended - 100% Free)

### Prerequisites
- GitHub account
- Repository pushed to GitHub
- Node.js installed locally

### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2: Deploy

```bash
npm run deploy
```

That's it! Your app will be live at:
```
https://riteshkawadkar.github.io/home-loan-optimizer/
```

### Step 3: Enable GitHub Pages (First Time Only)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select branch: `gh-pages`
4. Click **Save**
5. Wait 2-3 minutes for deployment

### Custom Domain (Optional)

1. Add a `CNAME` file to `public/` folder with your domain
2. In GitHub Settings → Pages, add your custom domain
3. Update DNS records at your domain provider

---

## ⚡ Vercel (Alternative - Free)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/riteshkawadkar/home-loan-optimizer)

### Manual Deploy

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts and you're done!

**Live URL:** `https://your-project.vercel.app`

### Features
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Custom domains
- ✅ Analytics included

---

## 🌐 Netlify (Alternative - Free)

### Drag & Drop Deploy

1. Build your app:
```bash
npm run build
```

2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder
4. Done!

### CLI Deploy

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

**Live URL:** `https://your-site.netlify.app`

### Features
- ✅ Continuous deployment
- ✅ Form handling
- ✅ Serverless functions
- ✅ Split testing

---

## ☁️ Cloudflare Pages (Alternative - Free)

### Deploy via GitHub

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your GitHub account
3. Select repository: `home-loan-optimizer`
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
5. Click **Save and Deploy**

**Live URL:** `https://home-loan-optimizer.pages.dev`

### Features
- ✅ Global CDN
- ✅ Unlimited bandwidth
- ✅ DDoS protection
- ✅ Web analytics

---

## 📊 Comparison

| Platform | Free Tier | Custom Domain | Build Time | CDN | Analytics |
|----------|-----------|---------------|------------|-----|-----------|
| **GitHub Pages** | ✅ Unlimited | ✅ Yes | ~2 min | ✅ Yes | ❌ No |
| **Vercel** | ✅ 100GB/month | ✅ Yes | ~1 min | ✅ Yes | ✅ Yes |
| **Netlify** | ✅ 100GB/month | ✅ Yes | ~1 min | ✅ Yes | ✅ Yes |
| **Cloudflare** | ✅ Unlimited | ✅ Yes | ~2 min | ✅ Yes | ✅ Yes |

---

## 🔧 Build Configuration

### Environment Variables

If you need environment variables:

**Vite (.env file):**
```env
VITE_API_KEY=your_key_here
```

**Access in code:**
```typescript
const apiKey = import.meta.env.VITE_API_KEY
```

### Build Optimization

Already configured in `vite.config.ts`:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

---

## 🌍 Custom Domain Setup

### GitHub Pages

1. Add `CNAME` file to `public/` folder:
```
yourdomain.com
```

2. Update DNS records:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Name: www
Value: riteshkawadkar.github.io
```

3. Enable HTTPS in GitHub Settings

### Vercel/Netlify/Cloudflare

1. Go to domain settings in dashboard
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

Now every push to `main` auto-deploys!

---

## 🐛 Troubleshooting

### Issue: 404 on refresh

**Solution:** Add `public/_redirects` (Netlify) or configure routing:

```
/* /index.html 200
```

### Issue: Assets not loading

**Solution:** Check `base` in `vite.config.ts` matches your URL path.

### Issue: Build fails

**Solution:** 
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Old version showing

**Solution:** Clear browser cache or hard refresh (Ctrl+Shift+R)

---

## 📈 Post-Deployment

### Monitor Your Site

1. **GitHub Pages:** Check Actions tab for deployment status
2. **Vercel/Netlify:** Dashboard shows deployment logs
3. **Analytics:** Add Google Analytics or Plausible

### Performance

Test your deployed site:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

### SEO

1. Add `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

2. Add meta tags in `index.html`

---

## 🎉 Success!

Your app is now live and accessible worldwide!

**Share your deployment:**
- Update README with live URL
- Add to GitHub repository description
- Share on social media
- Submit to directories

---

## 💡 Tips

1. **Use GitHub Pages** for simplicity
2. **Use Vercel** for best developer experience
3. **Use Netlify** for forms and functions
4. **Use Cloudflare** for maximum performance

All are excellent choices and 100% free for this project!

---

## 📞 Need Help?

- Check deployment logs for errors
- Review platform documentation
- Open an issue on GitHub
- Ask in community forums

Happy deploying! 🚀
