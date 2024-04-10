const { json } = require('express');

const mongoose = require('mongoose');
const User = require('../../models/user/User');
const NotificationLog = require('../../models/user/notificationlog');

module.exports = {

    sendAndroidNotifications: async function(deviceToken, data) {
        console.log("android");
       try {
            var FCM = require("fcm-node");
            // var serverKey = 'AIzaSyDU4gUw30sn0KluoAbVDq01C-wMNsnxsW0'; //put your server key here
            var serverKey =
                "AAAA0Hp8GCc:APA91bHeWG13Ze6m04POA2iMaT-gf1PuOTJVm9rcjUxJjtFAM7TrKE767-dFQA2GZUlDKluUprpZvncOWsJDLe-SiV0fTIVKffcsMD_6NBCk7A4xtU7vLREJqaD4xBLqp9tnLQjaYBJj"; //put your server key here
            var fcm = new FCM(serverKey);
            var message = {
                to: deviceToken,
                notification: {
                    title: data.notification.title,
                    body: data.notification.body
                },
                data: {
                    type: data.notification.notificationType,
                    name: data.notification.modelName,
                    _id: data.notification.modelId,
                    status:data.notification.modelstatus,
                    reason:data.notification.body,
                }
            };
            

            const user = await User.findOne({"_id": data.notification.sendToUser });
            fcm.send(message, function(err, response) {
            // return;
                if (err) {
                    console.log(err);
                    console.log("Something has gone wrong!   test");
                    const datas = {
                        body: message.data.screen_data,
                        notificationType:message.data.notificationType,
                        device_type:"Ios",
                        sendTo:user?.name,
                        sendToId:user?._id,
                        response:JSON.parse(err),
                    }; 
                    // NotificationLog.create(datas);
                } else {
                    console.log("Successfully sent with response: ", response);
                    const datas = {
                        body: message.data.screen_data,
                        notificationType: message.data.notificationType,
                        device_type:"Ios",
                        sendTo:user?.name,
                        sendToId:user?._id,
                        response:JSON.parse(response),
                    };  
                    console.log(datas);
                    // NotificationLog.create(datas);
                }
            });
              } catch (err) {
            console.log(err);
        }
    },

    sendAppleNotification: async function(deviceToken, data) {
        console.log("apple");
         try {
            var FCM = require("fcm-node");
            var serverKey =
                "AAAA0Hp8GCc:APA91bHeWG13Ze6m04POA2iMaT-gf1PuOTJVm9rcjUxJjtFAM7TrKE767-dFQA2GZUlDKluUprpZvncOWsJDLe-SiV0fTIVKffcsMD_6NBCk7A4xtU7vLREJqaD4xBLqp9tnLQjaYBJj"; //put your server key here
                var fcm = new FCM(serverKey);
                var message = {
                    to: deviceToken,
                    notification: {
                        title: data.notification.title,
                        body: data.notification.body
                    },
                    data: {
                        type: data.notification.notificationType,
                        name: data.notification.modelName,
                        _id: data.notification.modelId,
                        status:data.notification.modelstatus,
                        reason:data.notification.body,
                    }
                };
            const user = await User.findOne({"_id": data.notification.sendToUser });
            fcm.send(message, function(err, response) {
            // return;
                if (err) {
                    console.log(err);
                    console.log("Something has gone wrong!   test");
                    const datas = {
                        body: message.data.screen_data,
                        notificationType:  message.data.notificationType,
                        device_type:"Ios",
                        sendTo:user?.name,
                        sendToId:user?._id,
                        response:JSON.parse(err),
                    }; 
                    // NotificationLog.create(datas);
                } else {
                    console.log("Successfully sent with response: ", response);
                    const datas = {
                        body: message.data.screen_data,
                        notificationType:  message.data.notificationType,
                        device_type:"Ios",
                        sendTo:user?.name,
                        sendToId:user?._id,
                        response:JSON.parse(response),
                    };  
                    console.log(datas);
                    // NotificationLog.create(datas);
                }
            });
        } catch (err) {
            console.log(err);
        }
    },

};
