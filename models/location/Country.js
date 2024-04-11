const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    default: null
  },
  iso3: {
    type: String,
    default: null
  },
  iso2: {
    type: String,
    default: null
  },
  numeric_code: {
    type: String,
    default: null
  },
  phone_code: {
    type: String,
    default: null
  },
  capital: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: null
  },
  currency_name: {
    type: String,
    default: null
  },
  currency_symbol: {
    type: String,
    default: null
  },
  nationality: {
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
  emoji: {
    type: String,
    default: null
  },
  region: {
    type: String,
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

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
