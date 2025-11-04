# Supabase Storage Setup for Profile Avatars

## Steps to Create Storage Bucket

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name:** `profiles`
   - **Public bucket:** ✅ **YES** (check this box)
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/jpeg,image/jpg,image/png,image/webp`
5. Click **"Create bucket"**

### Option 2: Using SQL (Alternative)

If you prefer SQL, run this in the Supabase SQL Editor:

```sql
-- Create the profiles storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);
```

## Storage Policies (RLS)

Add these policies to allow authenticated users to upload/manage their avatars:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
)
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public to view avatars (for profile pictures)
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
);
```

## File Structure

Uploaded avatars will be stored as:
```
profiles/
  avatars/
    {userId}-{timestamp}.jpg
    {userId}-{timestamp}.png
    {userId}-{timestamp}.webp
```

Example:
```
profiles/avatars/a1b2c3d4-1699123456789.jpg
```

## Verification

After setup, verify the bucket exists:

1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named **"profiles"**
3. Click on it to view contents (will be empty initially)
4. Try uploading a test image to verify permissions

## Testing

Once the bucket is created, you can test the profile avatar upload feature:

1. Go to Settings → Profile in your app
2. Click "Change Photo"
3. Select an image (JPEG, PNG, or WebP, max 5MB)
4. Upload should succeed and display the new avatar

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `profiles` (lowercase)
- Verify the bucket was created successfully in the dashboard

### "Permission denied" error
- Check that RLS policies are created correctly
- Verify user is authenticated

### "File too large" error
- Ensure file is under 5MB
- Check file size limit in bucket settings

### Upload fails silently
- Check browser console for errors
- Verify MIME type is allowed
- Check network tab for failed requests

## Next Steps

After creating the storage bucket:
1. Test avatar upload in the profile settings page
2. Verify images are stored correctly
3. Check that old avatars are deleted when uploading new ones
4. Test with different image formats (JPEG, PNG, WebP)
