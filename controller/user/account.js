const User = require('../../models/user/User');
const UserDevice = require('../../models/user/UserDevice');
const EarnerScreen = require('../../models/user/EarnerScreen');
const Advertisement = require('../../models/user/Advertisement');
const EarnerLocation = require('../../models/user/EarnerLocation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signToken } = require('../../middleware/auth');
const nodemailer = require('nodemailer'); // Import nodemailer module for sending emails
let Notifications = require("../../middleware/sendEmail");
const stripe = require('stripe')(process.env.STRIPE_SK_KEY);
/**
 * Handles the sign-up process. 
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @param {*} next - The next middleware function in the stack.
 * @returns {Promise<void>} A Promise that resolves when the sign-up process is complete.
 */


/**************** Sign-Up-User *************/
async function signUp(req, res, next) {
  try {
      const { name, email, password, reenterPassword, user_role, deviceType, deviceToken,address,latitude,longitude } = req.body;

      // Validate fields for signup
      const signUpErrors = validateFields({ name, email, password, reenterPassword, user_role, deviceType, deviceToken }, true);

      // If any errors exist, return them
      if (signUpErrors.length > 0) {
          return res.status(404).json({ statusCode: 404, message: signUpErrors.join(", ") });
      }

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
          return res.status(404).json({ statusCode:404, message: "Email already exists" }); // Bad Request
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({ name, email, password: hashedPassword ,user_role,address,latitude,longitude,active_status:'allowed'});
      
      // Save the user to the database
      const savedUser = await newUser.save();

      // Save the user-device-info to the database
      const UserDeviceInfo = new UserDevice({ userId: savedUser._id, deviceType, deviceToken});
      const savedUserDeviceInfo = await UserDeviceInfo.save();

      // Generate token
      const token = jwt.sign({ id: savedUser._id }, "dcckdjckjdcjkd");

      // Send success response with token
      return res.status(200).json({ statusCode:200,message:"Data added successfully",user_role: newUser.user_role, token}); // Created
  } catch (error) {
      console.error("Caught error:", error); // Log the caught error
      next(error);
  }
}


  /**
   * Sign-In-User
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  async function userLogin(req, res, next) {
  try {
    const { email, password, deviceType, deviceToken, user_role } = req.body;

    // Validate fields for login
    const loginErrors = validateFields({ email, password, deviceType, deviceToken,user_role }, false);

    // If any errors exist, return them
    if (loginErrors.length > 0) {
      return res.status(404).json({ statusCode: 404, message: loginErrors.join(", ") });
    }

    // Check if the user exists in the database based on email or user_role
    const user = await User.findOne({ email, user_role });

    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

     // Check if the user is unblock
    if (user.active_status != 'allowed') {
      return res.status(404).json({ statusCode: 404, message: "User blocked by admin" });
    }

    // Check if the provided password matches the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // saved user-device-info
    const UserDeviceInfo = new UserDevice({ userId: user._id, deviceType, deviceToken});
    const savedUserDeviceInfo = await UserDeviceInfo.save();

    if (!isPasswordValid) {
      return res.status(401).json({ statusCode: 401, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = signToken({ id: user._id }); // Sign token using user ID

    // Send success response with token
    res.status(200).json({ statusCode: 200, user_role: user.user_role, message: "Login successful", token });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
  }

    /**
   * Sign-In-with-google
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */

    async function loginWithGoogle(req, res, next) {
      try {
          const { name,email, googleId, googleToken, deviceType, deviceToken, user_role,address,latitude,longitude } = req.body;
          let user;
  
          // Validate fields for name 
          if (!name) {
              return res.status(400).json({ statusCode: 400, message: "Name is required." });
          }

          // Validate fields for deviceType 
          if (!deviceType) {
            return res.status(400).json({ statusCode: 400, message: "deviceType is required." });
        }

          // Validate fields for user_role 
          if (!user_role) {
            return res.status(400).json({ statusCode: 400, message: "user_role is required." });
          }

          // Validate fields for deviceToken 
          if (!deviceToken) {
            return res.status(400).json({ statusCode: 400, message: "deviceToken is required." });
          }
          
          // Check if Google ID and email are provided and not empty
          if (!googleId && !email) {
              return res.status(400).json({ statusCode: 400, message: "Google ID or email is required." });
          }
  
          // Check if Google ID are provided and not empty
          
          if (!googleId) {
              // If only email is provided, check if user exists with that email
              user = await User.findOne({ email });
              
              if (user) {
                  if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
                  // If user with the same email exists, update the Social ID and Social Token
                  user.social_id = googleId;
                  user.social_token = googleToken;
                  user.login_source = 'google';
                  await user.save();
                  }
                  else{
                    return res.status(400).json({ statusCode: 400, message: "Invalid credentials." });
                  }
              } else {
                  // If user does not exist, create a new user
                  user = new User({ name,email, social_id: googleId, social_token: googleToken, user_role, login_source: 'google',address,latitude,longitude });
                  await user.save();
              }
          } else {
              // Check if the user exists in the database based on Google ID
              user = await User.findOne({ social_id: googleId , login_source: 'google'});
  
              // If user with Google ID exists
              if (user) {
                  // If both email and Google ID are provided, update the entry
                  if (email) {
                    if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
                      user.email = email;
                    }
                    else{
                      return res.status(400).json({ statusCode: 400, message: "Invalid credentials ." });
                    }
                  }
                  user.social_token = googleToken;
                  user.login_source = 'google';
                  await user.save();
              } else {
                  // If only Google ID is provided, check if user exists with that email
                  if (email) {
                      user = await User.findOne({ email });
                      if (user) {
                        if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
                          // If user with the same email exists, update the Social ID and Social Token
                          user.social_id = googleId;
                          user.social_token = googleToken;
                          user.login_source = 'google';
                          await user.save();
                        }
                        else{
                          return res.status(400).json({ statusCode: 400, message: "Invalid credentials." });
                        }
                      } else {
                          // If user does not exist, create a new user
                          user = new User({ name,email, social_id: googleId, social_token: googleToken, user_role, login_source: 'google' ,address,latitude,longitude});
                          await user.save();
                      }
                  } else {
                      // If Google ID does not exist and email is not provided, return an error
                      return res.status(400).json({ statusCode: 400, message: "Email is required." });
                  }
              }
          }
  
          // Save entry in UserDevice table
          const userDevice = new UserDevice({ userId: user._id, deviceType, deviceToken });
          await userDevice.save();
  
          // Generate JWT token
          const token = signToken({ id: user._id }); // Sign token using user ID
  
           // Check if the user is unblock
            if (user.active_status != 'allowed') {
              return res.status(404).json({ statusCode: 404, message: "User blocked by admin" });
            }

          // Send success response with token
          res.status(200).json({ statusCode: 200, user_role: user.user_role, message: "Login successful", token });
      } catch (error) {
          console.error("Caught error:", error);
          next(error);
      }
  }
  
   /**
   * Sign-In-with-facebook
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */



 async function loginWithApple(req, res, next) {
  try {
    const { name,email, appleId, appleToken, deviceType, deviceToken, user_role,address,latitude,longitude } = req.body;
    let user;

    // Validate fields for name 
    if (!name) {
        return res.status(400).json({ statusCode: 400, message: "Name is required." });
    }

    // Validate fields for deviceType 
    if (!deviceType) {
      return res.status(400).json({ statusCode: 400, message: "deviceType is required." });
  }

    // Validate fields for user_role 
    if (!user_role) {
      return res.status(400).json({ statusCode: 400, message: "user_role is required." });
    }

    // Validate fields for deviceToken 
    if (!deviceToken) {
      return res.status(400).json({ statusCode: 400, message: "deviceToken is required." });
    }
    
    // Check if apple ID and email are provided and not empty
    if (!appleId && !email) {
        return res.status(400).json({ statusCode: 400, message: "apple ID or email is required." });
    }

    // Check if apple ID are provided and not empty
    
    if (!appleId) {
        // If only email is provided, check if user exists with that email
        user = await User.findOne({ email });
        
        if (user) {
            if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
            // If user with the same email exists, update the Social ID and Social Token
            user.social_id = appleId;
            user.social_token = appleToken;
            user.login_source = 'apple';
            await user.save();
            }
            else{
              return res.status(400).json({ statusCode: 400, message: "Invalid credentials." });
            }
        } else {
            // If user does not exist, create a new user
            user = new User({ name,email, social_id: appleId, social_token: appleToken, user_role, login_source: 'apple',address,latitude,longitude });
            await user.save();
        }
    } else {
        // Check if the user exists in the database based on apple ID
        user = await User.findOne({ social_id: appleId , login_source: 'apple'});

        // If user with apple ID exists
        if (user) {
            // If both email and apple ID are provided, update the entry
            if (email) {
              if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
                user.email = email;
              }
              else{
                return res.status(400).json({ statusCode: 400, message: "Invalid credentials ." });
              }
            }
            user.social_token = appleToken;
            user.login_source = 'apple';
            await user.save();
        } else {
            // If only apple ID is provided, check if user exists with that email
            if (email) {
                user = await User.findOne({ email });
                if (user) {
                  if(user.user_role.toLowerCase() === req.body.user_role.toLowerCase()){
                    // If user with the same email exists, update the Social ID and Social Token
                    user.social_id = appleId;
                    user.social_token = appleToken;
                    user.login_source = 'apple';
                    await user.save();
                  }
                  else{
                    return res.status(400).json({ statusCode: 400, message: "Invalid credentials.3" });
                  }
                } else {
                    // If user does not exist, create a new user
                    user = new User({ name,email, social_id: appleId, social_token: appleToken, user_role, login_source: 'apple' ,address,latitude,longitude});
                    await user.save();
                }
            } else {
                // If apple ID does not exist and email is not provided, return an error
                return res.status(400).json({ statusCode: 400, message: "Email is required." });
            }
        }
    }

    // Save entry in UserDevice table
    const userDevice = new UserDevice({ userId: user._id, deviceType, deviceToken });
    await userDevice.save();

    // Generate JWT token
    const token = signToken({ id: user._id }); // Sign token using user ID


    // Check if the user is unblock
    if (user.active_status != 'allowed') {
      return res.status(404).json({ statusCode: 404, message: "User blocked by admin" });
    }

    
    // Send success response with token
    res.status(200).json({ statusCode: 200, user_role: user.user_role, message: "Login successful", token });
} catch (error) {
    console.error("Caught error:", error);
    next(error);
}
}

/**
 * Common Validation Function
 * @param {*} fields 
 * @param {int} isSignUp 
 * @returns 
 */
function validateFields(fields, isSignUp) {
  const errors = [];

  // Check if email is provided
  if (!fields.email) {
    errors.push("Please provide email");
  }

  // Check if password is provided
  if (!fields.password) {
    errors.push("Please provide password");
  }

  // Check if deviceType is provided
  if (!fields.deviceType) {
    errors.push("Please provide deviceType");
  }

  // Check if deviceToken is provided
  if (!fields.deviceToken) {
    errors.push("Please provide deviceToken");
  }

  // Additional validation for signup
  if (isSignUp) {
    // Check if name is provided
    if (!fields.name) {
      errors.push("Please provide name");
    }

    // Check if reenterPassword is provided
    if (!fields.reenterPassword) {
      errors.push("Please provide reenterPassword");
    }

    // Check if passwords match
    if (fields.password !== fields.reenterPassword) {
      errors.push("Passwords do not match");
    }

    // Check if user_role is provided
    if (!fields.user_role) {
      errors.push("Please provide user_role");
    }
  }

  return errors;
}


/**************** Edit-User-Profile *************/
async function editUserProfile(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    const stripeResponse = req.body.stripe_response; // Assuming stripe_response is provided in the request body

    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Update user data and set stripe_connect to true if stripe_response is provided
    if (stripeResponse) {
      user.stripe_connect = true;
      // Assuming you have a field named stripe_response in your user schema to store the response
      user.stripe_response = stripeResponse;
    }

    // Save the updated user data
    await user.save();

    // Send success response with user data including social_login and earnerLocation if applicable
    res.status(200).json({ statusCode: 200, message: "User updated successfully", userData: user });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

/**************** Get-User-Profile *************/
async function getUserProfile(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ statusCode: 401,  message: "Invalid authentication token" });
    }

    // Check if the user logged in using a social source
    const isLoginSocial = user.login_source ? true : false;
    const address = user.address ? user.address : null;
    const latitude = user.latitude? user.latitude : null;
    const longitude = user.longitude? user.longitude : null;
    // Create a new object including user data and social_login flag
    let userData = { ...user.toObject(), social_login: isLoginSocial , address: address , latitude: latitude , longitude: longitude };

  
    // If user role is 1, fetch data from earnerLocation model
    if (user.user_role === 'Teacher') {
      console.log(user._id,"cxzcxzc");
      const earnerLocationData = await EarnerLocation.findOne({ userId: user._id });
      if (earnerLocationData) {
        userData = { ...userData, earnerLocation: earnerLocationData.toObject() };
      }
    }

    // Send success response with user data including social_login and earnerLocation if applicable
    res.status(200).json({ statusCode: 200, message: "User Found successfully", userData });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Logout-User*************/
async function logOut(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    const deviceToken = req.body.deviceToken; // Assuming deviceId is provided in the request body
    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }
       // Delete the user device entry from the database
    const userDevice = await UserDevice.findOneAndDelete({ deviceToken: deviceToken, userId: userId });

    // Send success response
    res.status(200).json({ statusCode: 200, message: "User logout successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

/**************** Delete-User-Profile *************/
async function deleteAccount(req, res, next) {
  try {
    const userId = req.userId; // Assuming userId is extracted from the authentication token middleware
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }


    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

  //   if(user){
  //    // Check if password is provided
  //    if (!password) {
  //     return res.status(400).json({ statusCode: 400, message: "Password is required" });
  //   }
  // }

  if(req.body.password){
    // Check if the provided userId matches the user's userId
    if (user._id.toString() !== userId) {
      return res.status(403).json({ statusCode: 403, message: "Forbidden: userId mismatch" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(422).json({ statusCode: 422, message: "Incorrect password" });
    }
  }
    // Delete the user device entry from the database
    const userDevice = await UserDevice.deleteMany({ userId: userId });
    const earnerScreen = await EarnerScreen.deleteMany({ userId: userId });
    const advertisement = await Advertisement.deleteMany({ userId: userId });
    const earnerLocation = await EarnerLocation.deleteMany({ userId: userId });

    // Delete the user entry from the database
    await User.findOneAndDelete({ _id: userId });

    // Send success response
    res.status(200).json({ statusCode: 200, message: "User deleted successfully" });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** paymentIntent *************/
async function paymentIntent(req, res, next) {
  try {
      const user_id = req.userId; // Assuming user id is available in req.user
      // Create PaymentIntent with user_id
      const paymentIntent = await stripe.paymentIntents.create({
          amount: req.body.amount * 100,
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: { user_id: user_id },
          statement_descriptor_suffix: 'Test payment'
      });
      return res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (ex) {
      console.error(ex);
      return res.status(500).json({ error: ex.message });
  }
}


/**************** Stripe-Connect *************/
async function stripeConnect(req, res, next) {
  try {
    res.status(200).json();
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}


/**************** Forget-Password *************/
async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email; // Get email from request body
    const user_role = req.body.user_role; // Get email from request body
    
    // Find the user by email or role or block,unblock
    const user = await User.findOne({ email, user_role, active_status: 'allowed' });
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000); // Implement your OTP generation logic

    // Update user's OTP in the database
    user.verify_otp = otp;
    await user.save();

    let emailSubject = "Welcome to Trillboard!"
    let emailFileName = "user-forgotPassword"
    let replacements = {otp:otp,name:user.name}
    Notifications.sendEmail(
      email,
      emailSubject,
      emailFileName,
      replacements
    );
    
      res.status(200).json({
        statusCode: 200,
        message: "User found, OTP generated and sent via email",
        userData: {
          _id: user._id,
          email: user.email,
          // Add other user data fields as needed
        },
        otp: otp
      });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
  //tests
}


/**************** Verify-Otp *************/
async function verifyOtp(req, res, next) {
  try {
    const otp = req.body.verify_otp;

    if (!otp) {
      return res.status(404).json({ statusCode: 404, message: "Please fill required field" });
    }

    // Assuming you have a model named User and it has a field named verify_otp
    const user = await User.findOne({ verify_otp: otp }, { email: 1});

    // Check if user is found
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

       // Update the user document to set verify_otp to 0
      const result = await User.updateOne({ _id: user._id }, { $unset: { verify_otp: 1 } });
    
    // Send success response with user data (email and otp only)
    return res.status(200).json({ statusCode: 200, message: "Verify Otp Successfully", userData: user });
  } catch (error) {
    console.error("Caught error:", error);
    next(error);
  }
}

/**************** Reset-Password *************/
async function resetPassword(req, res, next) {
  try {
    const { newPassword, reenterPassword } = req.body;
    const userId = req.body.userId;

    // Check if userId is valid
    if (!userId) {
      return res.status(401).json({ statusCode: 401, message: "Invalid authentication token" });
    }

    // Check if new password and reentered password are provided
    if (!(newPassword && reenterPassword)) {
      return res.status(404).json({ statusCode: 404, message: "Please enter new password and reenter password" });
    }

    // Check if the new password and reentered password match
    if (newPassword !== reenterPassword) {
      return res.status(404).json({ statusCode: 404, message: "New password and reentered password do not match" });
    }

    // Find the user by userId
    const user = await User.findById(userId);

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



module.exports = {
    signUp,
    userLogin,
    loginWithGoogle,
    loginWithApple,
    getUserProfile,
    editUserProfile,
    forgotPassword,
    verifyOtp,
    paymentIntent,
    stripeConnect,
    resetPassword,
    logOut,
    deleteAccount,
};
