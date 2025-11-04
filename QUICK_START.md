# Quick Start Guide - Fix "Error creating event" Issue

## 🚨 You're seeing this error:

```
Error creating event: {}
```

## ✅ Here's the FIX (5 minutes):

### Step 1: Go to Supabase Dashboard

1. Open browser and go to: https://app.supabase.com
2. Login to your account
3. Select your project: **wcjirkkkibarzelkmtwq**

### Step 2: Open SQL Editor

1. Click **SQL Editor** in the left sidebar (looks like a document icon)
2. Click **New Query** button (green "+" button)

### Step 3: Run the Database Setup Script

1. Open the file `supabase-schema.sql` in this project folder
2. **Select ALL** text in that file (Ctrl+A or Cmd+A)
3. **Copy** all the text (Ctrl+C or Cmd+C)
4. Go back to Supabase SQL Editor
5. **Paste** into the editor (Ctrl+V or Cmd+V)
6. Click **Run** button (or press Ctrl+Enter)
7. Wait 2-3 seconds for "Success" message

You should see:
```
Success. No rows returned
```

### Step 4: Verify Tables Were Created

1. Click **Table Editor** in left sidebar (looks like a table icon)
2. You should now see TWO tables:
   - ✅ `events`
   - ✅ `guests`

If you see these tables, **YOU'RE DONE!** ✨

### Step 5: Test the App

1. Go back to your app in the browser
2. Refresh the page (F5)
3. Go to Dashboard (http://localhost:3000/dashboard)
4. Click **"Create New Event"**
5. Fill out the form:
   - Event name: "Test Wedding"
   - Date: Pick any future date
   - Venue: "Test Venue"
   - Bride: "Jane"
   - Groom: "John"
   - Template: Select "Modern"
6. Click **"Create Event"**

### Expected Result:

✅ Success toast notification appears!
✅ You get redirected (even if page shows 404, that's OK - we haven't built event detail page yet)
✅ Go back to dashboard - you should see your new event!

---

## 🎉 If It Works:

Congratulations! Your database is now set up. You can now:
- ✅ Create events
- ✅ View events on dashboard
- ✅ See guest statistics
- ✅ Continue development

---

## ❌ If You Still See Errors:

### Error: "Database table 'events' does not exist"

**Cause**: SQL script didn't run correctly

**Fix**:
1. Go back to Step 2
2. Make sure you copied **THE ENTIRE** `supabase-schema.sql` file
3. Check SQL Editor for error messages
4. Try running it again

### Error: "Permission denied"

**Cause**: You're not logged in or RLS policies failed to create

**Fix**:
1. Log out and log in again to the app
2. In Supabase, go to **Authentication** → **Policies**
3. Select `events` table
4. You should see 4 policies (view, insert, update, delete)
5. If not, run the SQL script again

### Error: Still showing "{}"

**Cause**: The improved error handling hasn't loaded yet

**Fix**:
1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Hard refresh browser (Ctrl+Shift+R)
4. Try creating event again

**Now you should see a HELPFUL error message instead of {}**

---

## 📋 Complete SQL Script Location

The SQL script is in your project root:
```
wedding-guest-app/
└── supabase-schema.sql  <-- This file!
```

**File size**: ~5-6 KB
**Lines**: ~170 lines
**What it creates**:
- 2 tables (events, guests)
- Indexes for performance
- RLS policies for security
- Triggers for timestamps
- View for statistics

---

## 🔍 How to Verify Setup is Complete

Run this checklist:

1. **Tables exist**:
   - Go to Table Editor
   - See `events` and `guests` tables ✅

2. **Can query tables**:
   - Go to SQL Editor
   - Run: `SELECT * FROM events;`
   - Should work (even if empty) ✅

3. **RLS policies exist**:
   - Go to Authentication → Policies
   - Select `events` table
   - See 4 policies ✅

4. **App can connect**:
   - Open browser console (F12)
   - No red errors ✅
   - Try creating event ✅

---

## 🎯 What Happens After Setup?

Once tables are created:

1. **Dashboard page** will load correctly
2. **Create Event** will work
3. **Event list** will display
4. **Statistics** will calculate

You'll be able to:
- ✅ Create unlimited events
- ✅ Each event gets a unique ID
- ✅ Data is secured with RLS
- ✅ Only you can see your events
- ✅ Stats auto-calculate

---

## 💡 Pro Tips

### Tip 1: Check Before Creating
Before creating an event, verify:
- You're logged in (see username in header)
- Dashboard loaded without errors
- No red errors in browser console

### Tip 2: Better Error Messages
We've improved error handling! Now you'll see:
- "Database table 'events' does not exist" - Run SQL script
- "Permission denied" - Check RLS policies
- "User not authenticated" - Log in again
- Specific database errors with details

### Tip 3: Quick Test Query
To test database access, run in SQL Editor:
```sql
SELECT * FROM events WHERE user_id = auth.uid();
```
This should work without errors (even if empty result).

---

## 📚 Additional Resources

- **Full Database Setup**: Read `DATABASE_SETUP.md`
- **Troubleshooting**: Read `TROUBLESHOOTING.md`
- **API Reference**: Read `API_REFERENCE.md`

---

## 🆘 Still Need Help?

1. **Check browser console** (F12 → Console tab)
2. **Copy the full error message**
3. **Check** which step failed
4. **Read** `TROUBLESHOOTING.md` for detailed solutions

---

**Time to complete**: 5 minutes
**Difficulty**: Easy
**Prerequisites**: Supabase account with project created

**Last updated**: 2024
