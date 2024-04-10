const mongoose = require('mongoose');
const double = require('mongoose-double')(mongoose);

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
    },
    latitude: {
        type: double,
    },
    longitude: {
        type: double,
    },
    zip_code: {
        type: String,
    },
    state: {
        type: String,
    },
    building_number: {
        type: String,
    },
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    nearby_address: {
        type: String,
    },
}, {
    timestamps: true // Add timestamps to the schema
});
const EarnerLocation = mongoose.model('EarnerLocation', userSchema);

module.exports = EarnerLocation;
