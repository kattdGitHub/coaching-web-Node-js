const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web', 'other'],
    required: true
  },
  deviceToken: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Add timestamps to the schema
});

const UserDevice = mongoose.model('UserDevice', userDeviceSchema);

module.exports = UserDevice;
