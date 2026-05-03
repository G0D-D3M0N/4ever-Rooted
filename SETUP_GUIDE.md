# 4ever Rooted — Setup & Deployment Guide

## 📋 Overview
**4ever Rooted** is a free developer learning platform with curated resources, interactive roadmaps, and a community-driven leaderboard system.

**Stack:** React + Express + Turso/LibSQL + Drizzle ORM + Clerk Auth

---

## 🚀 Deployment Status

### ✅ Live Database (Turso)
- **Database:** Turso (libsql) @ AWS AP-South-1
- **Status:** All data synced and ready
- **Data included:**
  - 249+ free developer resources (categories: Learning, Programming, Dev Tools, AI & ML, etc.)
  - 50+ interactive roadmaps (Placement 2026, JavaScript, React, Python, Node.js, Kubernetes, AWS, QA, Blockchain, etc.)
  - Leaderboard system with contributor rankings
  - User authentication via Clerk

---

## 🎯 Features Implemented

### Resources Library
- 249 curated free resources across 12 categories
- New categories: **Entertainment** (movies, anime, music, gaming, video tools) and **General Tools** (file tools, VPNs, storage, converters)
- Vote/upvote system with real-time counts
- FMHY (Free Media HYP) import ready (500-900 resources on-demand)

### Roadmaps (Learning Paths)
- 50+ interactive roadmaps with step-by-step guides
- **Key roadmaps:**
  - Placement Roadmap 2026 (18 steps: DSA → CS Fundamentals → Projects → Interviews)
  - Aptitude Roadmap (placement test prep)
  - Frontend, Backend, Full-Stack Development
  - Python, Node.js, Java, Rust, Go
  - Docker, Kubernetes, AWS, DevOps
  - Machine Learning, AI Engineering, Blockchain
  - QA & Testing, Product Management

### Mobile Experience
- Floating filter button (visible throughout page)
- Responsive sidebar drawer
- Admin mobile fixes
- Touch-friendly UI

### Leaderboard
- Top contributors (users with most approved submissions)
- Most-loved resources (highest upvotes)
- Live community stats (total resources, votes, submitters)

### Admin Panel
- Review pending resource submissions
- Bulk approve/reject resources
- Manage roadmaps and steps
- **Import from FMHY:** Button to fetch 500-900 resources automatically

---

## 🔧 Environment Variables (Already Set)

Your app uses these secrets from Replit:
```
TURSO_DATABASE_URL=libsql://4ever-rooted-g0d-d3m0n.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<your-token>
CLERK_SECRET_KEY=<your-key>
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_ADMIN_USER_IDS=user_3DB04F3K0eP3ijV2ZLHU5lCTPxa
```

All environment variables are configured. No additional setup needed.

---

## 📱 How to Use Hosted App

### View Content (Public)
1. **Resources:** `/resources` — Browse 249+ free resources
2. **Roadmaps:** `/roadmaps` → Select any roadmap to see step-by-step guide
3. **Leaderboard:** `/leaderboard` — See top contributors and most-loved links
4. **Paths:** `/paths` — Track learning progress

### Submit Resources (Must login)
1. Click **"Submit a Resource"** button in sidebar
2. Fill form (title, URL, category, description)
3. Admin reviews → appears live after approval

### Admin Panel (`/admin` — admin only)
1. **Pending Review:** Review community submissions
2. **All Resources:** Manage all approved resources
3. **Import FMHY:** Click "Import FMHY" button to fetch 500-900 free resources (auto-categorized)
4. **Roadmaps:** Create, edit, or delete learning paths

---

## 🔄 Data Sync Process

### Already Done ✅
```bash
npm run seed                      # Added 249 resources
tsx script/seed-new-roadmaps.ts  # Added 50 roadmaps with 480+ steps
```

All data is now in your live Turso database.

### If Browser Shows Empty After Deploy
**Hard refresh your browser:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or clear cache for your hosted domain. The API has the data — it's just cached.

---

## 🌐 Public URLs

- **Home:** `/`
- **Resources:** `/resources`
- **Roadmaps:** `/roadmaps` → `/roadmaps/:id` (detail view)
- **Leaderboard:** `/leaderboard` ⭐ (NEW)
- **Paths:** `/paths`
- **Admin Panel:** `/admin` (admin only)
- **Profile:** `/profile` (logged-in users)

---

## 📊 Database Schema

### Tables
- `resources` — 249 free links with votes, category, status (approved/pending/rejected)
- `roadmaps` — 50 learning paths
- `roadmap_steps` — 480+ individual steps with resources
- `user_progress` — Track which roadmap steps users completed
- `path_progress` — Track which learning paths users completed
- `resource_votes` — User upvotes on resources
- `notifications` — Submission approval/rejection alerts
- `users` — Clerk user sync (implicit)

---

## 🚀 Scaling & Future Edits

### To Add More Roadmaps
1. Edit `script/seed-new-roadmaps.ts`
2. Add new roadmap object with steps
3. Run: `tsx script/seed-new-roadmaps.ts`

### To Import FMHY Resources
1. Go to `/admin` → "All Resources" tab
2. Click **"Import FMHY"** button
3. Fetches 500-900 resources automatically (skips duplicates, adult content)

### To Edit Existing Content
1. **Resources:** Use admin panel → Edit button
2. **Roadmaps:** Use admin panel → Roadmaps tab → Edit button
3. Changes sync to live Turso immediately

---

## ✨ Key Highlights

| Feature | Status | Details |
|---------|--------|---------|
| **Resources** | ✅ Live | 249 resources across 12 categories |
| **Roadmaps** | ✅ Live | 50 roadmaps with 480+ steps |
| **Leaderboard** | ✅ Live | Track contributors & votes |
| **Mobile UX** | ✅ Live | Floating filter button + drawer |
| **Admin Panel** | ✅ Live | Review submissions, manage content |
| **FMHY Import** | ✅ Ready | One-click import (500-900 resources) |
| **Clerk Auth** | ✅ Live | Login via email/Google/GitHub |
| **Turso Database** | ✅ Live | All data persisted to production DB |

---

## 📞 Quick Reference

**Environment:** Production (Turso AWS AP-South-1)  
**Deployment:** Replit (auto-deployed via workflow)  
**Auth:** Clerk (development keys — safe for free tier)  
**Workflow:** `PORT=5000 npm run dev`  

Everything is ready to go. Hard refresh your browser and you'll see all 249 resources and 50 roadmaps live! 🎉
