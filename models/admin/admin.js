const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    verify_otp: {
        type: Number,
    } // otp for forgot password
});

// Define the model with the schema
const Admin = mongoose.model('Admin', userSchema);
module.exports = Admin;