const mongoose = require('mongoose');
const double = require('mongoose-double')(mongoose);

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },

    uniqueId: {
        type: String,
        unique:true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    dimension_height: {
        type: Number,
    },
    
    dimension_width: {
        type: Number,
    },

    location: {
        type: String,
    },

    latitude: {
        type: Number,  // use Number for double/float functionality
    },

    longitude: {
        type: Number,  // use Number for double/float functionality
    },

    photo: {
        type: String, // Assuming you store the photo file path or URL
    },

    status: {
        type: String,
        enum: ['approved','pending', 'rejected', 'active', 'deactivated'],  
    }, 

    rejection_reason: {
        type: String,
    },
    price: {
        type: double,
    },

  }, {
    timestamps: true // Add timestamps to the schema
});
userSchema.virtual("ismatch", {
    ref: "screenAlot",
    localField: "_id",
    foreignField: "screen_id",
    justOne: true,
  });
userSchema.set("toJSON", { virtuals: true });








// userSchema.pre('save', function(next) {
//     const generateUniqueId = () => {
//         const min = 10000;
//         const max = 99999;
//         return Math.floor(Math.random() * (max - min + 1) + min).toString();
//     };

//     if (!this.isNew || this.uniqueId) {
//         return next();
//     }

//     this.uniqueId = generateUniqueId();
//     next();
// });

const EarnerScreen = mongoose.model('EarnerScreen', userSchema);

module.exports = EarnerScreen;
