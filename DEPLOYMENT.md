# Deployment Guide for app.tasy.ai

## Option 1: Vercel (Recommended)

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js and deploy

3. **Configure Subdomain**
   - In Vercel project settings → Domains
   - Add `app.tasy.ai`
   - Vercel will show DNS instructions

4. **DNS Configuration**
   - Add CNAME record:
     - Name: `app`
     - Value: `cname.vercel-dns.com` (or value shown by Vercel)
   - TTL: 3600 (or default)

## Option 2: Self-Hosted with Nginx

If you're running both apps on the same server:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run the Next.js app** (on a different port, e.g., 3001)
   ```bash
   PORT=3001 npm start
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/app.tasy.ai`)
   ```nginx
   server {
       listen 80;
       server_name app.tasy.ai;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d app.tasy.ai
   ```

5. **DNS Configuration**
   - Add A record pointing to your server IP, OR
   - Add CNAME record: `app` → `tasy.ai` (if tasy.ai already points to your server)

## Option 3: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Then deploy with Docker Compose or your container platform.

## Important Notes

- **DNS Propagation**: Changes can take up to 48 hours, usually faster
- **SSL Certificate**: Use Let's Encrypt (free) for HTTPS
- **Environment Variables**: Set any required env vars in your deployment platform
- **Main Domain**: `tasy.ai` remains unchanged and points to your existing app

