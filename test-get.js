const axios = require('axios');

console.log('Testing GET /');

axios.get('http://localhost:5000/')
    .then(res => {
        console.log('✅ GET / successful:', res.data);
    })
    .catch(err => {
        console.error('❌ GET / failed:', err.message);
    });
