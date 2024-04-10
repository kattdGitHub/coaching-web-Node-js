const mongoose = require(`mongoose`);

const NotificationLogSchema = new mongoose.Schema({

    title: {
        type: String,
     },
     body: {
        type: String,
     },
     notificationType: {
        type: String,
     },
    device_type: {
        type: String,
    },
    response: {
        type: Object, 
    },
    sendTo: {
        type: String,
    },
    
    sendToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ScreenmodelId:{ type: mongoose.Schema.Types.ObjectId, ref: 'EarnerScreen' },
    AdvertisementmodelId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' },
}, { timestamps: true });


exports.module = mongoose.model(`notificationlog`, NotificationLogSchema);