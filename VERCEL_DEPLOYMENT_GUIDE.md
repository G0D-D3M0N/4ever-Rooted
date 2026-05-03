# 🚀 Complete Vercel + GoDaddy + GitHub Setup Guide

## ✅ What's Ready Now
- Code configured for Vercel
- CORS setup for custom domains
- Build tested and passing
- Database: 1,148 resources + 50 roadmaps
- Clerk authentication ready

---

## STEP 1: PUSH CODE TO GITHUB (5 minutes)

**In Replit Terminal, run:**
```bash
git add .
git commit -m "Configure for Vercel deployment with custom domain support"
git push origin main
```

**Expected:** Code appears on https://github.com/G0D-D3M0N/4everRooted

**If auth fails:** Create token at https://github.com/settings/tokens/new (repo scope), add to Replit Secrets as `GIT_TOKEN`, then retry.

---

## STEP 2: DEPLOY TO VERCEL (15 minutes)

### 2.1 Create Vercel Account
- Go to: https://vercel.com/signup
- Click "Continue with GitHub"
- Authorize Vercel

### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Select: **G0D-D3M0N/4everRooted**
3. Click "Import"
4. Keep defaults, click "Deploy"
5. **Wait 5-10 minutes**

### 2.3 Add Environment Variables
After deployment, go to **Settings → Environment Variables**

Add these 5 variables (copy from Replit Secrets):

| Key | Value | Scope |
|---|---|---|
| `CLERK_SECRET_KEY` | sk_test_1m1cHmdgmxTgqyfPdVy6LejikAwAlVYmjwbqsnaZO5 | Production, Preview, Development |
| `TURSO_DATABASE_URL` | libsql://4ever-rooted-g0d-d3m0n.aws-ap-south-1.turso.io | Production, Preview, Development |
| `TURSO_AUTH_TOKEN` | (from Replit Secrets) | Production, Preview, Development |
| `VITE_CLERK_PUBLISHABLE_KEY` | pk_test_dW5pcXVlLXBhbmdvbGluLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ | Production, Preview, Development |
| `CLERK_ADMIN_USER_IDS` | user_3DB04F3K0eP3ijV2ZLHU5lCTPxa | Production, Preview, Development |

**Save** → Vercel auto-redeploys (wait 2-3 minutes)

### 2.4 Test
Visit: https://4ever-rooted.vercel.app
- ✅ Should show resources, roadmaps, sign-in button

---

## STEP 3: CONNECT GODADDY DOMAIN (20 minutes)

### 3.1 Update GoDaddy Nameservers
1. Log in to GoDaddy.com
2. **My Products** → **Domains** → Your Domain
3. Click **"Manage DNS"**
4. Find **Nameservers** section
5. Replace with Vercel's:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```
6. **Save**
7. ⏳ **Wait 5-60 minutes for DNS propagation**

### 3.2 Connect Domain in Vercel
1. Vercel Dashboard → **Settings → Domains**
2. Click **"Add Domain"**
3. Type: `yourdomain.com` (your actual domain)
4. Click **"Add"**
5. **Wait for green checkmark** (DNS working)

### 3.3 Add www subdomain (optional)
1. Click **"Add Domain"** again
2. Type: `www.yourdomain.com`
3. Click **"Add"**

---

## STEP 4: SET CUSTOM_DOMAIN ENV VAR (2 minutes)

In Vercel: **Settings → Environment Variables**

Add:
- **Key:** `CUSTOM_DOMAIN`
- **Value:** `yourdomain.com` (without www, without https)
- **Scope:** All (Production, Preview, Development)

**Save** → Vercel auto-redeploys

---

## STEP 5: TEST YOUR DOMAIN (Wait 10 minutes)

Visit:
- https://yourdomain.com ✅
- https://www.yourdomain.com ✅

Both should work with full data loaded!

---

## STEP 6: (OPTIONAL) UPGRADE CLERK PRODUCTION KEYS

To remove "Development keys" warning:

1. Go to: https://dashboard.clerk.com
2. Switch to "Production" (top-left)
3. Copy **Publishable Key** (pk_live_...) and **Secret Key** (sk_live_...)
4. Update in Vercel env vars
5. Add domain to Clerk Dashboard → Domains

---

## AFTER SETUP: AUTO-DEPLOYMENT

Every push to GitHub auto-deploys:
```bash
git add .
git commit -m "your changes"
git push origin main
```

Vercel deploys in 1-2 minutes automatically!

---

## TROUBLESHOOTING

**"Domain not found"**
- Wait 60 minutes for DNS
- Test: `nslookup yourdomain.com`

**"CORS error"**
- Check `CUSTOM_DOMAIN=yourdomain.com` in Vercel (no https)
- Redeploy in Vercel

**"Data not loading"**
- Check Vercel Deployments → Logs
- Verify all 5 env vars match Replit exactly

**"Clerk not working"**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` in Vercel env vars
- Test at: yourdomain.com/auth

---

## YOUR FINAL STACK
- **Frontend:** React + Vite → Vercel CDN
- **Backend:** Express.js → Vercel Functions  
- **Database:** Turso (globally hosted)
- **Auth:** Clerk (test keys, upgradeable)
- **Domain:** yourdomain.com (GoDaddy)
- **Version Control:** GitHub
- **Hosting:** Vercel (auto-deploys)

🎉 Ready to deploy! Start with STEP 1.
