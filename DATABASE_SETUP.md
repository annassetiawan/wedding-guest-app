# Database Setup Instructions

This guide will help you set up the Supabase database for your Wedding Guest Management App.

## Prerequisites

- A Supabase account (https://supabase.com)
- Supabase project created
- Environment variables configured in `.env.local`

## Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Database Schema

Copy and paste the entire contents of `supabase-schema.sql` into the SQL Editor and click **Run**.

This will create:
- `events` table - Stores wedding event information
- `guests` table - Stores guest information for each event
- Indexes for better query performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- A view for events with guest statistics

### What Gets Created:

#### Events Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- name (Event name)
- event_date (Event date)
- venue (Event venue/location)
- bride_name (Bride's name)
- groom_name (Groom's name)
- template ('Modern' or 'Elegant')
- photo_url (Optional event photo)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### Guests Table
```sql
- id (UUID, Primary Key)
- event_id (UUID, Foreign Key to events)
- name (Guest name)
- phone (Guest phone number)
- category ('VIP', 'Regular', or 'Family')
- status ('pending', 'confirmed', or 'declined')
- checked_in (Boolean)
- checked_in_at (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Step 3: Verify Tables Created

After running the SQL script:

1. Go to **Table Editor** in the left sidebar
2. You should see two new tables:
   - `events`
   - `guests`

## Step 4: Test Row Level Security

The RLS policies ensure that:
- Users can only see/edit their own events
- Users can only see/edit guests from their own events
- All CRUD operations are protected

### To verify:
1. Create an account and log in to your app
2. Create an event
3. Try accessing the database directly - you should only see your own data

## Step 5: (Optional) Seed Sample Data

If you want to test with sample data, you can run this SQL in the SQL Editor:

```sql
-- Insert a sample event (replace USER_ID with your actual user ID from auth.users)
INSERT INTO events (user_id, name, event_date, venue, bride_name, groom_name, template)
VALUES (
  'YOUR_USER_ID_HERE',
  'Sarah & John Wedding',
  '2024-12-25',
  'Grand Ballroom, Hotel California',
  'Sarah',
  'John',
  'Modern'
) RETURNING *;

-- Insert sample guests (replace EVENT_ID with the ID from the event you just created)
INSERT INTO guests (event_id, name, phone, category, status)
VALUES
  ('YOUR_EVENT_ID_HERE', 'Alice Johnson', '+1234567890', 'VIP', 'confirmed'),
  ('YOUR_EVENT_ID_HERE', 'Bob Smith', '+1234567891', 'Regular', 'pending'),
  ('YOUR_EVENT_ID_HERE', 'Carol Williams', '+1234567892', 'Family', 'confirmed');
```

## Troubleshooting

### Issue: Tables don't appear
- **Solution**: Make sure you ran the entire SQL script without errors
- Check the SQL Editor for error messages

### Issue: RLS errors when accessing data
- **Solution**: Ensure you're logged in to your app
- Verify that the `user_id` in events table matches your auth.users ID

### Issue: Can't insert data
- **Solution**: Check that RLS policies are enabled
- Verify you're using the correct Supabase client (browser/server)

## Database Maintenance

### Backup
Supabase automatically backs up your database. You can also:
1. Go to **Database** > **Backups** in Supabase Dashboard
2. Create manual backups before major changes

### Monitoring
1. Go to **Database** > **Roles** to see connection stats
2. Check **Database** > **Extensions** for enabled features

## Next Steps

After setting up the database:
1. Configure your `.env.local` file with Supabase credentials
2. Run the development server: `npm run dev`
3. Create an account and start creating events!

## Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review RLS policies in **Authentication** > **Policies**
3. Check database logs in **Database** > **Logs**
