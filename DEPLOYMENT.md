# 🎬 CineView Hub - Deployment Guide

## Quick Start Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cineview-hub.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Environment Variables in Vercel**
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Option 2: Netlify

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Configure Environment Variables**
   - Go to Site Settings → Build & deploy → Environment
   - Add the same variables as above

### Option 3: Docker

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     gzip on;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t cineview-hub .
   docker run -p 8080:80 cineview-hub
   ```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)

### Environment Setup
- [ ] `.env` file configured locally
- [ ] Production environment variables added to hosting platform
- [ ] API keys are valid and have sufficient quotas
- [ ] Supabase project is in production mode

### Security
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] API keys are not committed to repository
- [ ] HTTPS is enforced
- [ ] Security headers configured

### Performance
- [ ] Images are optimized
- [ ] Code splitting is working
- [ ] Lazy loading is implemented
- [ ] Bundle size is acceptable (<500KB initial)

### SEO & Analytics
- [ ] Meta tags are properly configured
- [ ] Robots.txt is correct
- [ ] Sitemap.xml exists (if needed)
- [ ] Analytics tracking code added
- [ ] Social media cards tested

## Post-Deployment

### 1. Verify Deployment
- [ ] Site loads successfully
- [ ] All pages are accessible
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Images load properly

### 2. Test Core Features
- [ ] Search functionality
- [ ] Movie/TV show details
- [ ] Watchlist management
- [ ] User authentication
- [ ] Responsive design

### 3. Monitor Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Monitor error rates
- [ ] Check API usage

### 4. Set Up Monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_TMDB_API_KEY` | TMDB API key | Yes | `abc123...` |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJ...` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | No | `G-XXXXXXXXX` |
| `VITE_SENTRY_DSN` | Sentry DSN | No | `https://...` |

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS
4. SSL certificate auto-configured

## Troubleshooting

### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart development server after changes
- Check variable names match exactly
- Verify no typos in values

### CORS Errors
- Check TMDB API key is valid
- Verify Supabase URL and key
- Check if RLS policies allow requests

### Images Not Loading
- Verify TMDB API key
- Check image URLs in console
- Ensure CDN URLs are accessible

## Performance Optimization

### After Deployment
1. **Enable Compression**: Gzip/Brotli on server
2. **Add CDN**: Use Vercel/Netlify CDN
3. **Cache Headers**: Configure proper caching
4. **Image Optimization**: Use WebP format
5. **Code Splitting**: Already configured

### Monitoring Tools
- **Google Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **GTmetrix**: Page speed testing
- **Pingdom**: Uptime monitoring

## Scaling Considerations

### Database
- Monitor Supabase usage
- Upgrade plan if needed
- Optimize queries
- Add indexes for frequent queries

### API Usage
- Monitor TMDB API calls
- Implement caching
- Consider rate limiting
- Upgrade API tier if needed

### CDN & Hosting
- Use edge functions for dynamic content
- Implement ISR (Incremental Static Regeneration)
- Consider serverless functions
- Add Redis for caching

## Support & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs weekly
- [ ] Review analytics monthly
- [ ] Update content as needed
- [ ] Test critical flows monthly

### Emergency Contacts
- TMDB Support: developer@themoviedb.org
- Supabase Support: support@supabase.io
- Hosting Support: Check platform docs

## Additional Resources

- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deploy](https://reactrouter.com/en/main/guides/deploying)
- [Supabase Docs](https://supabase.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org/3)

---

**Need Help?** Open an issue on GitHub or contact support.

Last Updated: February 1, 2026
