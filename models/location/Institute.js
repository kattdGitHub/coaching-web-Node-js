const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: null
  },
  image_id: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  lat: {
    type: String,
    default: null
  },
  lng: {
    type: String,
    default: null
  },
  web_link: {
    type: String,
    default: null
  },
  primary_phone: {
    type: String,
    default: null
  },
  secondary_phone: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  description: {
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

const Institute = mongoose.model('Institute', instituteSchema);

module.exports = Institute;
