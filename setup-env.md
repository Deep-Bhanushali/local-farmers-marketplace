# Environment Setup Guide

## 🔧 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/local-farmers-marketplace

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration (optional for testing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Quick Setup

### 1. Create the .env.local file:

```bash
# Windows PowerShell
New-Item -Path ".env.local" -ItemType File

# Or manually create the file in your project root
```

### 2. Add the content above to the file

### 3. For Stripe (Optional):

- Sign up at [stripe.com](https://stripe.com)
- Go to Developers → API keys
- Copy your test keys (sk*test*... and pk*test*...)

### 4. Generate JWT Secret:

```bash
# Generate a random string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## ✅ Testing Without Stripe

If you don't want to set up Stripe right now, you can:

1. Leave the Stripe keys empty
2. The app will work but show a warning about Stripe being disabled
3. Orders will be created with "pending" payment status

## 🔄 Restart Required

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```
