const mongoose = require('mongoose');

const instructionsSchema = new mongoose.Schema({
    earner_instruction: {
        type: String,
    },
    advertiser_instruction: {
        type: String,
    },
  }, {
    timestamps: true // Add timestamps to the schema
});


const Instructions = mongoose.model('Instructions', instructionsSchema);

module.exports = Instructions;
