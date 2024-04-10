const mongoose = require('mongoose');
const double = require('mongoose-double')(mongoose);

const screenAlotSchema = new mongoose.Schema({
    advertisement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement', // Reference to the Advertisement model
        required: true
    },
    screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EarnerScreen', // Reference to the EarnerScreen model
    },
    earner_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    },
    advertiser_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    },
    payment_response: {
        type: mongoose.Schema.Types.Mixed, // Store arbitrary data including JSON objects
    },
    start_time:{
        type: String,
    },
    end_time:{
        type: String,
    },
    screen_price:{
        type: Number,
    },
}, {
    timestamps: true // Add timestamps to the schema
});

// screenAlot model
const screenAlot = mongoose.model('screenAlot', screenAlotSchema);

module.exports = screenAlot;
