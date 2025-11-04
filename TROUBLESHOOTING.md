# Troubleshooting Guide

This guide helps you resolve common issues with the Wedding Guest Management App.

## Error: "Error creating event: {}" or Empty Error Object

### Likely Cause
The database tables have not been created yet in Supabase.

### Solution - Quick Setup

Follow these steps **in order**:

#### Step 1: Verify Supabase Connection

1. Open `.env.local` and verify you have valid credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Your credentials look correct if they have this format:
   - URL starts with `https://` and ends with `.supabase.co`
   - ANON_KEY is a long JWT token (starts with `eyJ...`)

#### Step 2: Create Database Tables

**THIS IS THE MOST IMPORTANT STEP!**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `wcjirkkkibarzelkmtwq`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase-schema.sql` from your project
6. Copy **ALL** contents (from line 1 to the end)
7. Paste into the SQL Editor
8. Click **Run** (or press Ctrl/Cmd + Enter)
9. Wait for "Success" message

#### Step 3: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** in left sidebar
2. You should see TWO new tables:
   - ✅ `events`
   - ✅ `guests`
3. Click on `events` table - you should see these columns:
   - id, user_id, name, event_date, venue, bride_name, groom_name, template, photo_url, created_at, updated_at

#### Step 4: Test the App

1. Restart your dev server:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:3000
3. Login to your account
4. Go to Dashboard
5. Click **"Create New Event"**
6. Fill out the form
7. Click **"Create Event"**

### Expected Result
✅ Event created successfully!
✅ Redirected to event detail page
✅ Toast notification: "Event created successfully!"

---

## Error: "Database table 'events' does not exist"

### Cause
SQL script wasn't run or failed to execute.

### Solution

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this test query:
   ```sql
   SELECT * FROM events;
   ```
3. If you see error "relation 'events' does not exist":
   - Run the FULL `supabase-schema.sql` script
   - Check for any error messages in SQL Editor
   - Make sure you're in the correct project

4. If query works but returns empty:
   - ✅ Tables exist! Your issue is elsewhere.

---

## Error: "Permission denied" or "42501"

### Cause
Row Level Security (RLS) policies are blocking access.

### Solution

#### Option 1: Verify RLS Policies Exist

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Select `events` table
3. You should see these policies:
   - "Users can view own events"
   - "Users can insert own events"
   - "Users can update own events"
   - "Users can delete own events"

4. If policies are missing, run the SQL script again (it includes RLS setup)

#### Option 2: Check User Authentication

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Run this:
   ```javascript
   const { createClient } = await import('./src/lib/supabase/client.ts')
   const supabase = createClient()
   const { data } = await supabase.auth.getUser()
   console.log('User:', data.user)
   ```
4. If user is `null`:
   - Log out and log in again
   - Clear browser cookies
   - Check if email is verified

---

## Error: "User not authenticated"

### Cause
Your auth session expired or cookies were cleared.

### Solution

1. **Log out and log in again**
   - Click "Sign Out" in dashboard
   - Go to `/login`
   - Sign in with your credentials

2. **Clear browser cache**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cookies and cached files
   - Restart browser

3. **Check Supabase Auth Settings**
   - Go to Supabase Dashboard → **Authentication** → **Settings**
   - Verify "Enable email confirmations" is ON
   - Check if your email is confirmed in **Authentication** → **Users**

---

## Error: Dashboard Shows "Failed to load events"

### Cause
Database connection issue or tables don't exist.

### Solution

1. **Check browser console for errors**:
   - Press F12 → Console tab
   - Look for error messages
   - Copy error details

2. **Test database connection**:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM events WHERE user_id = auth.uid();
   ```

3. **Verify your user ID**:
   - Supabase Dashboard → **Authentication** → **Users**
   - Find your user and copy the UUID
   - Verify this matches the user_id in events

---

## Error: Build Fails with Console Errors

### Cause
ESLint blocking console statements (already fixed).

### Solution
Already fixed in `eslint.config.mjs`. If you still see this:

1. Delete `.next` folder:
   ```bash
   rm -rf .next
   # or on Windows:
   rmdir /s .next
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

---

## No Events Showing on Dashboard

### Possible Causes & Solutions

#### 1. No events created yet
- **Solution**: Click "Create New Event" to add your first event

#### 2. Events exist but not showing
- **Solution**: Check browser console for errors
- Run this in Supabase SQL Editor:
  ```sql
  SELECT * FROM events WHERE user_id = auth.uid();
  ```
- If this returns events, the issue is in the frontend

#### 3. RLS blocking access
- **Solution**: Verify RLS policies (see above)
- Test without RLS:
  ```sql
  -- TEMPORARILY disable RLS (testing only!)
  ALTER TABLE events DISABLE ROW LEVEL SECURITY;

  -- Check if you can see events now
  SELECT * FROM events;

  -- IMPORTANT: Re-enable RLS after testing!
  ALTER TABLE events ENABLE ROW LEVEL SECURITY;
  ```

---

## How to Reset Everything

If nothing works, start fresh:

### 1. Drop All Tables
```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS events CASCADE;
```

### 2. Run Schema Again
Copy and run the entire `supabase-schema.sql` file

### 3. Clear Browser Data
- Clear cookies
- Clear localStorage
- Restart browser

### 4. Log In Again
- Go to `/login`
- Sign in
- Try creating an event

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] ✅ `.env.local` has valid Supabase credentials
- [ ] ✅ Dev server is running (`npm run dev`)
- [ ] ✅ Browser console shows no errors
- [ ] ✅ Logged in as a user
- [ ] ✅ Email is verified (check in Supabase Auth → Users)
- [ ] ✅ `events` table exists (Supabase Table Editor)
- [ ] ✅ `guests` table exists (Supabase Table Editor)
- [ ] ✅ RLS policies exist (Supabase Auth → Policies)
- [ ] ✅ Can run `SELECT * FROM events` in SQL Editor
- [ ] ✅ User ID matches between auth.users and events.user_id

---

## Getting More Help

### 1. Check Error Messages
The app now shows helpful error messages:
- "Database table 'events' does not exist" → Run SQL script
- "Permission denied" → Check RLS policies
- "User not authenticated" → Log in again

### 2. Browser Console
Press F12 and check Console tab for detailed errors

### 3. Supabase Logs
- Go to Supabase Dashboard → **Logs**
- Check for database errors
- Look for failed queries

### 4. Enable Debug Mode
Add to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

### 5. Test Individual Services
Open browser console and run:
```javascript
// Test event service
const { eventService } = await import('./src/lib/services/events.ts')
const events = await eventService.getEventsWithStats()
console.log('Events:', events)
```

---

## Common Setup Mistakes

### ❌ Mistake 1: Didn't Run SQL Script
**Symptom**: Empty error object, no tables in Table Editor
**Fix**: Run `supabase-schema.sql` in SQL Editor

### ❌ Mistake 2: Ran Partial SQL Script
**Symptom**: Some tables exist but not others, RLS errors
**Fix**: Run the ENTIRE script from start to finish

### ❌ Mistake 3: Wrong Supabase Project
**Symptom**: Tables don't appear, wrong data shows up
**Fix**: Verify project URL matches in dashboard and `.env.local`

### ❌ Mistake 4: Email Not Verified
**Symptom**: Can login but get permission errors
**Fix**: Check email for verification link, or verify in Supabase dashboard

### ❌ Mistake 5: Using Old Auth Token
**Symptom**: User authenticated but can't access data
**Fix**: Log out and log in again to refresh token

---

## Still Having Issues?

If none of the above works:

1. **Check the implementation progress**:
   - Read `IMPLEMENTATION_PROGRESS.md`
   - Verify which features are completed

2. **Review the database setup**:
   - Read `DATABASE_SETUP.md`
   - Follow steps exactly as written

3. **Check API reference**:
   - Read `API_REFERENCE.md`
   - Test service methods individually

4. **Supabase Documentation**:
   - https://supabase.com/docs/guides/auth
   - https://supabase.com/docs/guides/database/postgres

---

## Success Indicators

You'll know everything works when:

✅ Dashboard loads without errors
✅ Stats show "0" (or your actual numbers)
✅ Can click "Create New Event"
✅ Form submits successfully
✅ Toast shows "Event created successfully!"
✅ Redirects to event detail (even if page not built yet)
✅ Dashboard shows your new event card

---

**Last Updated**: 2024
**Version**: 1.0
