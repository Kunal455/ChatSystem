# Cloudinary Setup Guide

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (free tier includes 25GB storage)
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your credentials:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Add Credentials to .env File

Create or update your `.env` file in the `Backend` folder:

```env
# Existing variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Verify Installation

The following packages are already installed in your `package.json`:
- ✅ `cloudinary` - Main Cloudinary SDK
- ✅ `multer-storage-cloudinary` - Multer storage engine for Cloudinary

## Step 5: Test the Setup

1. Start your backend server: `npm start`
2. Try registering a new user with a profile picture
3. Check your Cloudinary dashboard - you should see the uploaded image in the `chat-app/profile-pics` folder

## How It Works

- When a user uploads a profile picture, it's automatically uploaded to Cloudinary
- The image is optimized (resized to 500x500, auto quality)
- Cloudinary returns a URL (e.g., `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/chat-app/profile-pics/image-1234567890.jpg`)
- This URL is stored in the database instead of a local file path
- Images are served directly from Cloudinary CDN (faster and more reliable)

## Benefits of Cloudinary

✅ **No local storage needed** - Images stored in the cloud  
✅ **Automatic optimization** - Images are compressed and optimized  
✅ **CDN delivery** - Fast image loading worldwide  
✅ **Transformations** - Easy to resize, crop, or apply filters  
✅ **Free tier** - 25GB storage and 25GB bandwidth per month  

## Troubleshooting

### Error: "Invalid API Key"
- Double-check your `.env` file has the correct credentials
- Make sure there are no extra spaces or quotes
- Restart your server after updating `.env`

### Error: "Cloud name is required"
- Ensure `CLOUDINARY_CLOUD_NAME` is set in your `.env` file
- Check for typos in the variable name

### Images not uploading
- Check file size (max 5MB)
- Verify file format (jpg, jpeg, png, gif, webp only)
- Check server console for error messages

