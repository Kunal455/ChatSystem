const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const testRegister = async () => {
    try {
        const form = new FormData();

        // Add text fields
        form.append('fullname', 'Test User');
        form.append('username', 'testuser_' + Date.now());
        form.append('email', 'testuser_' + Date.now() + '@test.com');
        form.append('gender', 'Male');
        form.append('password', 'Test@123');

        // Add a test image (create a small test image or use existing one)
        // For now, we'll create a small PNG buffer
        const pngBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x08, 0x5B, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x01, 0x01, 0x00, 0x1A, 0xA5, 0x27, 0x42,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ]);

        form.append('profilepic', pngBuffer, 'test.png');

        // Make the request
        const response = await axios.post('http://localhost:5000/api/auth/register', form, {
            headers: form.getHeaders(),
        });

        console.log('✅ Registration successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

        if (response.data.user) {
            console.log('\n📸 Profile Picture URL:', response.data.user.profilepic);
        }

    } catch (error) {
        console.error('❌ Registration failed!');
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("Request Error - No response received");
            console.error("Request:", error.request);
        } else {
            console.error("Error:", error.message);
            console.error("Stack:", error.stack);
        }
    }
};

testRegister();
