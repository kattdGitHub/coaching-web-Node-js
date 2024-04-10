const express = require('express');
const router = express.Router();
const Controller = require('../../controller/user/account');
const authentication = require("../../middleware/auth") // Assuming your controller is defined in a separate file

const app = express(); // Define your Express app instance



/*********************************** Auth Api's *****************************/

router.post("/signUp", Controller.signUp);
router.post("/login", Controller.userLogin);
router.post("/login-with-google", Controller.loginWithGoogle);
router.post("/login-with-apple", Controller.loginWithApple);
router.post("/edit-user-profile",authentication.verifyToken, Controller.editUserProfile);
router.get("/get-user-profile",authentication.verifyToken, Controller.getUserProfile);
router.post("/forgot-password",Controller.forgotPassword);
router.post("/reset-password",Controller.resetPassword);
router.post("/verify-otp",Controller.verifyOtp);
router.post("/logout",authentication.verifyToken, Controller.logOut);
router.post("/delete-account",authentication.verifyToken, Controller.deleteAccount);
router.get("/stripe-connect",Controller.stripeConnect);
router.get("/payment-intent",authentication.verifyToken, Controller.paymentIntent);
/********************************** ******************************************/

module.exports = router;
