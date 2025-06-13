# Kairo - Focus Timer App

## 🚀 Deployment

### Branches

- **`main`** - Production branch (auto-deploys to Vercel)
- **`dev`** - Development branch (preview deployments)
- **`feature/*`** - Feature branches (preview deployments)

### Environment Setup

#### Development

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Start development servers
npm run dev
```

#### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Strategy

#### Frontend (Vercel)

- **Production**: Auto-deploy from `main` branch
- **Preview**: Auto-deploy from `dev` and feature branches
- **Domain**: [Will be set after Vercel deployment]

#### Backend (Current: Local)

- MongoDB connection via environment variables
- API endpoints running locally during development
- TODO: Consider deploying to Vercel Functions or Railway

### Environment Variables

#### Required for Production:

```env
VITE_API_URL=https://your-backend-url.com
VITE_ENVIRONMENT=production
```

#### Development:

```env
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

### Workflow

1. **Feature Development**:

   ```bash
   git checkout dev
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR to dev branch
   ```

2. **Testing**:

   ```bash
   git checkout dev
   git merge feature/new-feature
   git push origin dev
   # Test on preview deployment
   ```

3. **Production Release**:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   # Auto-deploys to production
   ```

### API Integration

Currently the app uses localStorage for data persistence. For full deployment:

1. **Option A**: Keep localStorage (client-side only)
2. **Option B**: Deploy backend to Vercel Functions
3. **Option C**: Use external service (Supabase, Firebase, etc.)

### Next Steps

- [ ] Deploy to Vercel
- [ ] Set up environment variables
- [ ] Configure domain
- [ ] Add backend deployment (optional)
- [ ] Set up monitoring/analytics
