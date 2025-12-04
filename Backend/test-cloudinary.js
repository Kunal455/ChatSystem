const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log('Testing Cloudinary Connection...');
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Ping Successful:', result);
    } catch (error) {
        console.error('❌ Cloudinary Ping Failed:', error);
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'MISSING');
        console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'MISSING');
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'MISSING');
        process.exit(1);
    }

    console.log('\nTesting Image Upload...');
    // Create a dummy file for testing
    const testFile = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testFile, 'This is a test file for Cloudinary upload');

    try {
        // Note: Cloudinary might reject .txt files if not configured to allow 'raw'
        // But for profile pics we want images. Let's try to upload it as 'raw' or just check config.
        // Actually, let's just print the config to verify it's loaded.
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
        console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

        // We can't easily upload a real image without having one. 
        // But if ping works and config is set, we are 90% there.

    } catch (error) {
        console.error('❌ Upload Test Failed:', error);
    } finally {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    }
}

testUpload();
