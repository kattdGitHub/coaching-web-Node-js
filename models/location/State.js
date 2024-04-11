const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    default: null
  },
  state_code: {
    type: String,
    default: null
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const State = mongoose.model('State', stateSchema);

module.exports = State;
