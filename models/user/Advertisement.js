const mongoose = require('mongoose');
const double = require('mongoose-double')(mongoose);

const advertisementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    uniqueId: {
        type: String,
        unique:true
    },
    description: {
        type: String,
        required: true
    },
    campaign_link: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    latitude: {
        type: double,
    },
    longitude: {
        type: double,
    },
    video: {
        type: String, // Assuming you store the video file path or URL
    },
    photos: {
        type: [String], // Define photos as an array of strings
        default: []
    },
    
    status: {
        type: String,
        enum: ['approved','pending', 'rejected', 'active', 'deactivated'],  
    }, 

    date: {
        type: Date,
    },
    start_time: {
        type: String,
    },
    end_time: {
        type: String,
    },
    rejection_reason: {
        type: String,
    },
    
}, {
    timestamps: true // Add timestamps to the schema
});

advertisementSchema.pre('save', function(next) {
    const generateUniqueId = () => {
        const min = 10000;
        const max = 99999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    };

    if (!this.isNew || this.uniqueId) {
        return next();
    }

    this.uniqueId = generateUniqueId();
    next();
});

// Advertisement model
const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
