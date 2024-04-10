const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    address: {
        type: String,
    },
    latitude: {
       type: Number,
    },
    longitude: {
        type: Number,
    },
    verify_otp: {
        type: Number,
    }, // otp for forgot password
    user_role: {
        type: String,
        enum: ['Institute', 'Teacher','Student'],
    }, // role of user

    active_status: {
        type: String,
        enum: ['blocked', 'allowed'],
        default: 'allowed' // Set the default value to 2 (Unblock)
    }, // 1 for Block or 2 for Unblock
    login_source: {
        type: String,
        enum: ['facebook', 'google','apple'],
    }, // which type of social you login
    social_id: {
        type: String,
    }, 
    social_token: {
        type: String,
    },
    stripe_connect: {
        type: String,
    },
    stripe_response: {
        type: String,
    }
}, {
    timestamps: true // Add timestamps
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
