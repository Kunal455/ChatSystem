const axios = require('axios');

const login = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@gmail.com',
            password: 'password123'
        });
        console.log('Response:', res.status, res.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Response:', error.response.status, error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
};

login();
