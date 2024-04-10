const jwt = require('jsonwebtoken'); // Import JWT module
const mysql = require('mysql');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const dbConfig = require('../../config/database');
const Admin = require('../../models/admin/admin');
const Users = require('../../models/user/User');
const UserDevice = require('../../models/user/UserDevice');
const Advertisement = require('../../models/user/Advertisement');
const EarnerScreen = require('../../models/user/EarnerScreen');
const EarnerLocation = require('../../models/user/EarnerLocation');
const Instruction = require('../../models/user/Instructions');
const Notification = require('../../controller/user/notifications');
const nodemailer = require('nodemailer'); // Import nodemailer module for sending emails
const ejs = require('ejs');
let Notifications = require("../../middleware/sendEmail")

// Create a MySQL connection pool using the config
const pool = mysql.createPool(dbConfig);

//******************* Admin Login **************************/
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ message: "Please enter your email and password to login" }); // Bad Request
    }

    // Find the admin user by email
    const adminUser = await Admin.findOne({ email });

    // Check if admin user exists
    if (!adminUser) {
      return res.status(401).json({ message: "Invalid credentials" }); // Unauthorized
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" }); // Unauthorized
    }

    // Generate token
    const token = jwt.sign({ id: adminUser._id }, "1234"); // Modify to include user ID
    // Send token in response body
    return res.status(200).json({ message: "Login Successfully" ,token }); // OK
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return next(error);
  }
}

/**************** List of Users************/
async function userList(req, res, next) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip
    const skip = (page - 1) * limit;

    // Role filter
    let roleFilter = {}; // Default filter to fetch all users
    const roleParam = req.query.role; // Get the role parameter from the URL
      roleFilter = { user_role: roleParam }; // Set the role filter if a valid role is provided

    // User Id filter
    let IdFilter = {}; // Default filter to fetch all users
    if (req.query.userId) { // Check if userId is a valid number
      IdFilter = { _id: req.query.userId }; // Set the userId filter if a valid userId is provided
    }

    let data;
    // If role filter is provided
    if (req.query.role) {
      // Find the data, applying pagination and role filter
      data = await Users.find(roleFilter).skip(skip).limit(limit);
    } else if (req.query.userId) { // If userId filter is provided
      // Find the data, applying userId filter
      data = await Users.find(IdFilter).skip(skip).limit(limit);
    } else {
      // Find the data, applying pagination
      data = await Users.find().skip(skip).limit(limit);
    }

    // Check if data exists
    if (!data || data.length === 0) {
      return res.status(404).json({ statusCode: 404, message: "Data not found" });
    }

    // Prepare response array
    const responseData = [];

    // Loop through users to fetch earnerLocations data
    for (const user of data) {
      // Find earnerLocation data for the current user
      const earnerLocationsData = await EarnerLocation.findOne({ userId: user._id });

      // Prepare user object
      const userObj = {
        _id: user._id,
        name: user.name,
        email: user.email,
        user_role: user.user_role,
        active_status: user.active_status,
        address: user.address? user.address : null,
        latitude: user.latitude? user.latitude : null,
        longitude: user.longitude? user.longitude : null,
        // Add earnerLocationsData if exists, otherwise set it to null
        earnerLocationsData: earnerLocationsData ? earnerLocationsData : null
      };

      // Push user object to responseData array
      responseData.push(userObj);
    }

    // Send success response with the data
    return res.status(200).json({ statusCode: 200, message: "Data retrieved successfully", data: responseData });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}

/**************** List of Advertisements************/
async function advertisementsList(req, res, next) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip
    const skip = (page - 1) * limit;

    // Check if userId or advertisementId is provided in the query parameters
    const userId = req.query.userId;
    const advertisementId = req.query.advertisementId;

    // Define the filter object based on the presence of userId or advertisementId
    const filter = {};
    if (userId) filter.userId = userId;
    if (advertisementId) filter._id = advertisementId;

    // Find the data, applying pagination, filtering, and populating user data
    const data = await Advertisement.find(filter).populate('userId').skip(skip).limit(limit);

    // Check if data exists
    if (!data || data.length === 0) {
      return res.status(404).json({ statusCode: 404, message: "Data not found" });
    }

    // Send success response with the data
    return res.status(200).json({ statusCode: 200, message: "Data retrieved successfully", data: data });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}



/**************** Dashboard api's Data************/
async function totalData(req, res, next) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip
    const skip = (page - 1) * limit;

    const Teacher = 'Teacher';
    const Institute = 'Institute';
    
    // Count the total number of entries in User and Advertisement models
    const totalEarnerEntries = await Users.countDocuments({ user_role: Teacher });
    const totalAdvertiserEntries = await Users.countDocuments({ user_role: Institute});
    const totalAdvertisementEntries = await Advertisement.countDocuments();
    const totalEarnerScreen = await EarnerScreen.countDocuments();

  
    // Send success response with the data and counts
    return res.status(200).json({ 
      statusCode: 200, 
      totalEarnerEntries: totalEarnerEntries,
      totalAdvertiserEntries: totalAdvertiserEntries,
      totalAdvertisementEntries: totalAdvertisementEntries,
      totalEarnerScreenEntries: totalEarnerScreen
    });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}

/**************** screen-list *************/
async function screensList(req, res, next) {
  try {
    let query = {}; // Initialize an empty query object
    
    // Extract userId and screenId from URL parameters
    const userId = req.query.userId;
    const screenId = req.query.screenId;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip
    const skip = (page - 1) * limit;

    // If userId is provided, add it to the query
    if (userId) {
      query.userId = userId;
    }

    // If screenId is provided, add it to the query
    if (screenId) {
      query._id = screenId;
    }

    // Find the data based on the constructed query, applying pagination and populating user data
    const data = await EarnerScreen.find(query).populate('userId').skip(skip).limit(limit);

    // Check if data exists
    if (!data || data.length === 0) {
      return res.status(404).json({ statusCode: 404, message: "Data not found" });
    }

    // Send success response with the data
    return res.status(200).json({ statusCode: 200, message: "Data retrieved successfully", page: page, data: data });
  } catch (error) {
    console.error("Caught error:", error); // Log the caught error
    return res.status(500).json({ statusCode: 500, error });
  }
}



/**************** Delete-Advertisement *************/
async function deleteAdvertisement(req, res, next) {
  try {
    const advertisementId = req.query.advertisementId; 
    if (!advertisementId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id" });
    }
     // Find the advertisement
    const advertisement = await Advertisement.findOneAndDelete({ _id: new ObjectId(advertisementId) });
    if (!advertisement) {
      return res.status(200).json({ statusCode: 200, message: "data not found" });
    }  
    // Send success response
    res.status(200).json({ statusCode: 200, message: " deleted successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Approve-Advertisement *************/
async function advertisementsApprove(req, res, next) {
  try {
    const advertisementId = req.query.advertisementId;
    const status = req.query.status;
    const rejection_reason = req.query.rejection_reason;

    if (!advertisementId || !status) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id or Status" });
    }

    // Find the advertisement and update its status
    const advertisement = await Advertisement.findOneAndUpdate(
      { _id: new ObjectId(advertisementId) },
      { status: status,rejection_reason:rejection_reason },
      { new: true } // To return the updated document
    );

    if (!advertisement) {
      return res.status(404).json({ statusCode: 404, message: "Advertisement not found" });
    }

    if (advertisement) {
      let isJobRunning = true;

      if (advertisement.status === 1) {
        title = "approved";
        } else if (advertisement.status === 2) {
         title = "rejected";
        } else {
          title = "";
        }

      // setTimeout(async () => {
          if (isJobRunning) {
              const userId = advertisement.userId; // Assuming `advertisement.userId` is the ID of the user you want to send the notification to
  
              bodyPayload = {
                notification: {
                    title: `Your advertisement is ${title}`,
                    body:  advertisement.rejection_reason,
                    sendToUser: userId,
                    notificationType: "Advertisement",
                    modelName: advertisement.name,
                    modelId: advertisement._id,
                    modelstatus: parseInt(advertisement.status), 
                },
            };
            
              // await NotificationTable.create(bodyPayload.notification);
  
               
              const targetUserDeviceTokens = await UserDevice.find({ userId: userId });

              if (targetUserDeviceTokens && targetUserDeviceTokens.length > 0) {
                // Iterate through all devices associated with the user
                for (const userDevice of targetUserDeviceTokens) {
                    if (userDevice.deviceType === 'android') {
                        console.log("android");
                        Notification.sendAndroidNotifications(userDevice.deviceToken, bodyPayload);
                    } else if (userDevice.deviceType === 'ios') {
                        console.log("ios");
                        Notification.sendAppleNotification(userDevice.deviceToken, bodyPayload);
                    } else {
                        console.log("Unknown platform:", userDevice.deviceType);
                    }
                }
            } else {
                console.log("No user devices found for the specified user ID");
            }
            
          }
      // }, 2000);
  }

    // Send success response
    res.status(200).json({ statusCode: 200, message: "Advertisement updated successfully", advertisement });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

/**************** Approve-Screen *************/
async function screenApprove(req, res, next) {
  try {
    const screenId = req.query.screenId;
    const status = req.query.status;
    const rejection_reason = req.query.rejection_reason;

    if (!screenId || !status) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id or Status" });
    }

    // Find the Screen and update its status
    const screen = await EarnerScreen.findOneAndUpdate(
      { _id: new ObjectId(screenId) },
      { status: status,rejection_reason:rejection_reason },
      { new: true } // To return the updated document
    );

    if (!screen) {
      return res.status(404).json({ statusCode: 404, message: "Screen not found" });
    }

    if (screen) {
      let isJobRunning = true;

      // setTimeout(async () => {
          if (isJobRunning) {
              const userId = screen.userId; // Assuming `screen.userId` is the ID of the user you want to send the notification to
  
              bodyPayload = {
                notification: {
                    title: `Your screen is ${screen.status}`,
                    body: screen.rejection_reason,
                    sendToUser: userId,
                    notificationType: "Screen",
                    modelName: screen.name,
                    modelId: screen._id,
                    modelstatus: screen.status, 
                },
            };
            
              // await NotificationTable.create(bodyPayload.notification);
  
              const targetUserDeviceTokens = await UserDevice.find({ userId: userId });

               if (targetUserDeviceTokens && targetUserDeviceTokens.length > 0) {
                // Iterate through all devices associated with the user
                for (const userDevice of targetUserDeviceTokens) {
                    if (userDevice.deviceType === 'android') {
                        console.log("android");
                        Notification.sendAndroidNotifications(userDevice.deviceToken, bodyPayload);
                    } else if (userDevice.deviceType === 'ios') {
                        console.log("ios");
                        Notification.sendAppleNotification(userDevice.deviceToken, bodyPayload);
                    } else {
                        console.log("Unknown platform:", userDevice.deviceType);
                    }
                }
            } else {
                console.log("No user devices found for the specified user ID");
            }
          }
      // }, 2000);
  }
    // Send success response
    res.status(200).json({ statusCode: 200, message: "Screen updated successfully", screen });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** update-Instruction *************/
async function updateInstruction(req, res, next) {
  try {
     const { earner_instruction, advertiser_instruction } = req.body;
    
   
    // Check if data already exists
    let existingData = await Instruction.findOne();

    if (existingData) {
      // Update existing data
      existingData.earner_instruction = earner_instruction;
      existingData.advertiser_instruction = advertiser_instruction;
      await existingData.save();

      return res.status(200).json({ statusCode: 200, message: "Data updated successfully", data: existingData });
    } else {
      // Create a new data entry
      const newData = new Instruction({ earner_instruction, advertiser_instruction });
      
      // Save the data to the database
      const savedData = await newData.save();
      
      return res.status(200).json({ statusCode: 200, message: "Data added successfully", data: savedData });
    }
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ statusCode: 500, error });
  }
}


/**************** get-Instruction *************/
async function getInstruction(req, res, next) {
  try {  
    const instructions = await Instruction.find(); 
    // Send success response
    if (instructions) {
      res.status(200).json({ statusCode: 200, message: "Instructions retrieved successfully", instructions });
    } else {
      res.status(404).json({ statusCode: 404, message: "Instructions not found" });
    }
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Delete-Screen *************/
async function deleteScreen(req, res, next) {
  try {
    const screenId = req.query.screenId; 
    if (!screenId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id" });
    }

    // Find the screen
    const screen = await EarnerScreen.findOneAndDelete({ _id: screenId });
    if (!screen) {
      return res.status(200).json({ statusCode: 200, message: "data not found" });
    }  
    // Send success response
    res.status(200).json({ statusCode: 200, message: " deleted successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Delete-User-Profile *************/
async function deleteUser(req, res, next) {
  try {
    const userId = req.query.userId; 
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id" });
    }

    // Find the user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(200).json({ statusCode: 200, message: "User not found" });
    }

    // Delete the user device entry from the database
    const userDevice = await UserDevice.deleteMany({ userId: userId });
    const earnerScreen = await EarnerScreen.deleteMany({ userId: userId });
    const admindvertisement = await Advertisement.deleteMany({ userId: userId });
    const earnerLocation = await EarnerLocation.deleteMany({ userId: userId });

    // Delete the user entry from the database
    await Users.findOneAndDelete({ _id: userId });

    // Send success response
    res.status(200).json({ statusCode: 200, message: "User deleted successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Block-User-Profile *************/
async function blockUncblockUser(req, res, next) {
  // console.log("fdgfdg");
  // return;
  try {
    const userId = req.query.userId; 
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid Id" });
    }

    // Find the user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    // Toggle active_status between 1 and 2
    const newActiveStatus = user.active_status === 'blocked' ? 'allowed' : 'blocked';

    // Update the user's active_status in the database
    user.active_status = newActiveStatus;
    await user.save();

    // Send success response
    res.status(200).json({ statusCode: 200, message: `User status toggled successfully. New status: ${newActiveStatus}` });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

/**************** Forgot-Password *************/
async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email; // Get email from request body
    // Find the user by email
    const user = await Admin.findOne({ email});
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000); // Implement your OTP generation logic

    // Update user's OTP in the database
    user.verify_otp = otp;
    await user.save();

    let emailUser = "dhaliwalsheenu496@gmail.com"
    let emailSubject = "Welcome to Trillboard!"
    let emailFileName = "admin-forgotPassword"
    let replacements = {otp:otp}
    Notifications.sendEmail(
      emailUser,
      emailSubject,
      emailFileName,
      replacements
    );
    
      res.status(200).json({
        statusCode: 200,
        message: "User found, OTP generated and sent via email",
        userData: {
          userId: user._id,
          email: user.email,
          // Add other user data fields as needed
        },
        otp: otp
      });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Update-Password *************/
async function updatePassword(req, res, next) {
  try {
    const { newPassword, reenterPassword } = req.body;
  
    // Check if new password and reentered password are provided
    if (!(newPassword && reenterPassword)) {
      return res.status(404).json({ statusCode: 404, message: "Please enter new password and reenter password" });
    }

    // Check if the new password and reentered password match
    if (newPassword !== reenterPassword) {
      return res.status(404).json({ statusCode: 404, message: "New password and reentered password do not match" });
    }

    // Find the user 
    const user = await Admin.findOne();

    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Send success response with token
    res.status(200).json({ statusCode: 200, message: "Password updated successfully"});
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Logout-admin*************/
async function logOut(req, res, next) {
  try {
    // Assuming you're using JWT tokens for authentication
    // Clear the token from the client-side (browser)
    res.clearCookie('jwt'); // Assuming you're using cookies for token storage

    // Send success response
    res.status(200).json({ statusCode: 200, message: "User logout successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

module.exports = {
  adminLogin,
  userList,
  totalData,
  advertisementsList,
  screensList,
  deleteUser,
  screenApprove,
  advertisementsApprove,
  deleteAdvertisement,
  deleteScreen,
  blockUncblockUser,
  forgotPassword,
  updatePassword,
  updateInstruction,
  getInstruction,
  logOut,
};
