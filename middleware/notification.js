const { json } = require('express');

const mongoose = require('mongoose'),
    Notification = mongoose.model(`notification`);
    NotificationLog  = mongoose.model(`notificationlog`);
    User = mongoose.model("user"),
module.exports = {

    sendAndroidNotifications: async function(deviceToken, data) {
      try {
            // {
            //     title: data.title,
            //     body: data.body,
            //     sender: data.otherUserId,
            //     sendToUser: data.sendToUser,
            //     notificationType: data.notificationType,
            // }
            var FCM = require("fcm-node");
            // var serverKey = 'AIzaSyDU4gUw30sn0KluoAbVDq01C-wMNsnxsW0'; //put your server key here
            var serverKey =
                "AAAAiTowUKw:APA91bFlSkKU6j4kl1anQYXNgKdW6LUnw_7yWHHGMwS60lOdyIeI5kDkxFVmyhxFHqpQmMTDa0L3TOuhftrhWVbITQ7HR_qOgFXiBXEdIbRmB3SN9xWr061LNV5vZEoKGYCD307Jx05i"; //put your server key here
            var fcm = new FCM(serverKey);
            var message = {
                to: deviceToken,
                notification: data.notification,
                data: {
                    type: data.notification.notificationType,
                    ID: data.notification.modelId,
                }
            };
           
          
            const user = await User.findOne({"userDeviceInfo.token": deviceToken })
            // console.log(user?.userInfo?.firstName,"name")
            // await Notification.create(data.notification);
            fcm.send(message, function(err, response) {
                if (err) {
                    console.log(err)
                    console.log("Something has gone wrong!   test");
                    const datas = {
                        title: message.notification.title,
                        body: message.notification.body,
                        notificationType: message.notification.notificationType,
                        NewsmodelId:message?.notification?.NewsmodelId,
                        NotificationmodelId: message?.notification?.NotificationmodelId,     
                        device_type:"android",
                        sendTo:user?.userInfo?.firstName,
                        sendToId:user?._id,
                        response:JSON.parse(err),
                        } 
                    NotificationLog.create(datas);
                       } else {
                    const datas = {
                        title: message.notification.title,
                        body: message.notification.body,
                        notificationType: message.notification.notificationType,
                        device_type:"android",
                        NewsmodelId:message?.notification?.NewsmodelId,
                        NotificationmodelId: message?.notification?.NotificationmodelId,   
                        sendTo:user?.userInfo?.firstName,
                        sendToId:user?._id,
                        response:JSON.parse(response),
                        }  
                    NotificationLog.create(datas);
                    }
            });
        } catch (err) {
            console.log(err)
        }
    },

    sendAppleNotification: async function(deviceToken, data) {
        try {
            var FCM = require("fcm-node");
            var serverKey =
                "AAAAiTowUKw:APA91bFlSkKU6j4kl1anQYXNgKdW6LUnw_7yWHHGMwS60lOdyIeI5kDkxFVmyhxFHqpQmMTDa0L3TOuhftrhWVbITQ7HR_qOgFXiBXEdIbRmB3SN9xWr061LNV5vZEoKGYCD307Jx05i"; //put your server key here
            var fcm = new FCM(serverKey);
            var message = {
                to: deviceToken,
                data: {
                    type: data.notification.notificationType,
                    ID: data.notification.modelId,
                }
               
                // data: {
                //     //you can send only notification or only data(or include both)
                //     title: data.title,
                //     body: data.body,
                //     sender: data.otherUserId,
                //     sendToUser: data.sendToUser,
                //     notificationType: data.notificationType,
                //     sendToUser: data.userId,
                //     notificationType: data.notificationType,
                // },
            };
            
            const user = await User.findOne({"userDeviceInfo.token": deviceToken })
            console.log(user,"my dataaaaaaaaaa");
            // return;
            fcm.send(message, function(err, response) {
                if (err) {
                    console.log(err)
                    console.log("Something has gone wrong!   test");
                    const datas = {
                        title: message.notification.title,
                        body: message.notification.body,
                        notificationType: message.notification.notificationType,
                        device_type:"Ios",
                        sendTo:user?.userInfo?.firstName,
                        sendToId:user?._id,
                        response:JSON.parse(err),
                        } 
                    NotificationLog.create(datas);
                } else {
                    console.log("Successfully sent with response: ", response);
                    const datas = {
                        title: message.notification.title,
                        body: message.notification.body,
                        notificationType: message.notification.notificationType,
                        device_type:"ios",
                        sendTo:user?.userInfo?.firstName,
                        sendToId:user?._id,
                        response:JSON.parse(response),
                        }  
                    NotificationLog.create(datas);
                }
            });
        } catch (err) {
            console.log(err)
        }
    },

};