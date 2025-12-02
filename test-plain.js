const axios = require('axios');

console.log('Testing plain POST to /api/auth/register (NO file)...');

const testPlainRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            fullname: 'Test User Plain',
            username: 'testplain_' + Date.now(),
            email: 'testplain_' + Date.now() + '@test.com',
            gender: 'Male',
            password: 'Test@123'
        });

        console.log('✅ Registration (no file) successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ Registration failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('Request Error - No response received');
            console.error('Message:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testPlainRegister();
