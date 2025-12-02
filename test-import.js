console.log('Testing upload middleware initialization...');

try {
    const upload = require('./Backend/middleware/upload.js');
    console.log('✅ Upload middleware loaded successfully!');
    console.log('Upload object:', upload);
    console.log('Upload.single:', typeof upload.single);
} catch (error) {
    console.error('❌ Error loading upload middleware:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
}
