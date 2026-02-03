# Netlify 404 Fix - Setup Instructions

## ✅ Files Created:
1. `netlify.toml` (root directory) - Netlify configuration
2. `client/public/_redirects` - Redirects file (copied to dist during build)

## 🔧 Netlify Dashboard Settings

**CRITICAL:** Go to your Netlify dashboard and verify these settings:

1. **Site Settings → Build & Deploy → Build Settings**
   - **Base directory:** `client` (MUST be set)
   - **Build command:** `npm install && npm run build` (or leave empty to use netlify.toml)
   - **Publish directory:** `dist` (relative to base, so it's `client/dist`)

2. **Site Settings → Build & Deploy → Continuous Deployment**
   - Make sure it's connected to your GitHub repo
   - Branch: `main`

## 🚀 After Updating Settings:

1. **Trigger a new deploy:**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

2. **Wait for build to complete**

3. **Test your site:**
   - Visit: `https://stunning-cheesecake-33c551.netlify.app`
   - Try refreshing the page
   - Check browser console for any errors

## 🔍 Troubleshooting:

If still getting 404:

1. **Check build logs:**
   - Go to **Deploys** → Click on latest deploy → **View build log**
   - Verify `_redirects` file is in the build output

2. **Verify _redirects file exists:**
   - In build logs, look for: `dist/_redirects`
   - Should contain: `/*    /index.html   200`

3. **Clear Netlify cache:**
   - **Site Settings → Build & Deploy → Build settings**
   - Click **Clear cache and retry deploy**

4. **Alternative:** If base directory doesn't work, try:
   - Set **Base directory:** (empty)
   - Set **Build command:** `cd client && npm install && npm run build`
   - Set **Publish directory:** `client/dist`
