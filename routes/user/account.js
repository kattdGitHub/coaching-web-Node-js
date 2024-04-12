const express = require('express');
const router = express.Router();
const Controller = require('../../controller/user/account');
const authentication = require("../../middleware/auth") ;
const {upload} = require("../../middleware/upload");
const AppController = require('../../controller/user/users/Institute.js');
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
router.post("/uploadProfileImage",upload.single("photo"),authentication.verifyToken, Controller.uploadProfileImage);
router.post("/logout",authentication.verifyToken, Controller.logOut);
router.post("/delete-account",authentication.verifyToken, Controller.deleteAccount);
router.get("/stripe-connect",Controller.stripeConnect);
router.get("/payment-intent",authentication.verifyToken, Controller.paymentIntent);
router.post("/add-location", authentication.verifyToken,AppController.addLocation);

/********************************** ******************************************/

const CountryController = require('../../controller/location/CountryController');
const StateController = require('../../controller/location/StateController');
const CityController = require('../../controller/location/CityController');
const CourseController = require('../../controller/location/CourseController.js');
const CommonController = require('../../controller/location/CommonController.js');


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

// Lookup API 
// Country API functions
router.post('/country-list',authentication.verifyToken, CountryController.countryList);
router.post('/create-country',authentication.verifyToken, CountryController.createCountry);
router.post('/update-country',authentication.verifyToken, CountryController.updateCountry);
router.post('/delete-country',authentication.verifyToken, CountryController.deleteCountry);

// State API functions
router.post('/state-list',authentication.verifyToken, StateController.stateList);
router.post('/create-state',authentication.verifyToken, StateController.createState);
router.post('/update-state',authentication.verifyToken, StateController.updateState);
router.post('/delete-state',authentication.verifyToken, StateController.deleteState);

// City API functions
router.post('/city-list',authentication.verifyToken, CityController.cityList);
router.post('/create-city',authentication.verifyToken, CityController.createCity);
router.post('/update-city',authentication.verifyToken, CityController.updateCity);
router.post('/delete-city',authentication.verifyToken, CityController.deleteCity);

// Course API functions
router.post('/course-list',authentication.verifyToken, CourseController.courseList);
router.post('/create-course',authentication.verifyToken, CourseController.createCourse);
router.post('/update-course',authentication.verifyToken, CourseController.updateCourse);
router.post('/delete-course',authentication.verifyToken, CourseController.deleteCourse);

// Common Use API functions
router.post('/country-option',authentication.verifyToken, CommonController.countryOption);
router.post('/state-option',authentication.verifyToken, CommonController.stateOption);
router.post('/city-option',authentication.verifyToken, CommonController.cityOption);
router.post('/course-option',authentication.verifyToken, CommonController.courseOption);


module.exports = router;
