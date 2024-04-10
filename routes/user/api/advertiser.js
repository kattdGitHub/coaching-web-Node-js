const express = require('express');
const router = express.Router();
const Controller = require('../../../controller/user/users/advertiser');
const authentication = require("../../../middleware/auth") // Assuming your controller is defined in a separate file
const app = express(); // Define your Express app instance
const {upload} = require("../../../middleware/upload")

/*********************************** Advertiser Api's *****************************/
//
router.post("/create-advertisement",upload.fields([{name:"photos",maxCount:5},{name:"video",maxCount:1}]), authentication.verifyToken,Controller.createAdvertisement);
router.get("/advertisement-list",authentication.verifyToken,Controller.advertisementList);
router.get("/advertisement-detail",authentication.verifyToken,Controller.AdvertisementDetail);
router.post("/add-location-advertisement",authentication.verifyToken,Controller.AddLocationadvertisement);
router.post("/delete-advertisement",authentication.verifyToken,Controller.deleteAdvertisement);
router.get("/instructions",authentication.verifyToken,Controller.instructions);
router.get("/crowd-density",Controller.estimateCrowdDensity);
router.get("/alot-screen", authentication.verifyToken,Controller.alotScreen);
/**********************************   Advertiser Api's ******************************************/

module.exports = router;
