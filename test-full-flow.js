const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./Backend/model/userModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'Backend/.env') });

const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    fullname: 'Integration Test User',
    username: 'testuser_' + Date.now(),
    email: 'testuser_' + Date.now() + '@example.com',
    password: 'password123',
    gender: 'male',
    confirmPassword: 'password123'
};

async function runTest() {
    try {
        // 0. Connect to DB to access verification codes
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // 1. Register
        console.log(`\n📝 Registering user: ${TEST_USER.email}`);
        const regRes = await axios.post(`${BASE_URL}/register`, TEST_USER);
        console.log('✅ Registration success:', regRes.data.message);

        // 2. Fetch User & Verification Code from DB
        console.log('🔍 Fetching verification code from DB...');
        // Wait a moment for DB write
        await new Promise(r => setTimeout(r, 1000));

        const user = await User.findOne({ email: TEST_USER.email });
        if (!user) throw new Error('User not found in DB');
        if (!user.verificationCode) throw new Error('No verification code found');

        console.log('✅ Found code:', user.verificationCode);

        // 3. Verify Email
        console.log(`\n📧 Verifying email with code: ${user.verificationCode}`);
        const verifyRes = await axios.post(`${BASE_URL}/verifyemail`, {
            code: user.verificationCode
        });
        console.log('✅ Verification success:', verifyRes.data.message);

        // 4. Login
        console.log('\n🔐 Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        console.log('✅ Login success!');
        console.log(`👤 User ID: ${loginRes.data.user._id}`);
        console.log(`🎫 Auth Token Cookie received:`, loginRes.headers['set-cookie'] ? 'Yes' : 'No');

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    } finally {
        // Cleanup: Delete test user
        if (TEST_USER.email) {
            console.log('\n🧹 Cleaning up test user...');
            await User.deleteOne({ email: TEST_USER.email });
            console.log('✅ Cleanup done');
        }
        await mongoose.disconnect();
    }
}

runTest();
