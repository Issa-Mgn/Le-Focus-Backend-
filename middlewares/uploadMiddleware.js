const multer = require('multer');

// Configure multer to store files in memory (useful for uploading to 3rd party services)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limit file size to 10MB (adjust as needed)
    }
});

module.exports = upload;
