const express = require('express');
const router = express.Router();
const Controller = require('../../../controller/user/users/earner');
const authentication = require("../../../middleware/auth") // Assuming your controller is defined in a separate file
const app = express(); // Define your Express app instance
const {upload} = require("../../../middleware/upload")



/*********************************** Earner Api's *****************************/

router.post("/create-screen",upload.single("photo"), authentication.verifyToken,Controller.createScreen);
router.get("/screens-list",upload.single("photo"), authentication.verifyToken,Controller.screensList);
router.get("/screen-detail",upload.single("photo"), authentication.verifyToken,Controller.screenDetail);
router.post("/edit-screen",upload.single("photo"), authentication.verifyToken,Controller.EditScreen);
router.post("/delete-screen",authentication.verifyToken,Controller.deleteScreen);
router.post("/add-loaction",upload.single("photo"), authentication.verifyToken,Controller.addLocation);
router.get("/instructions",authentication.verifyToken,Controller.instructions);
router.get("/advertisement-list", authentication.verifyToken,Controller.advertisementList);
/**********************************   Earner Api's ******************************************/

module.exports = router;
