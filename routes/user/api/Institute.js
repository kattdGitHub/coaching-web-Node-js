const express = require('express');
const router = express.Router();
const Controller = require('../../../controller/user/users/Institute');
const authentication = require("../../../middleware/auth") // Assuming your controller is defined in a separate file
const app = express(); // Define your Express app instance
const {upload} = require("../../../middleware/upload")



/*********************************** Earner Api's *****************************/

router.post("/create-institute",upload.single("photo"), authentication.verifyToken,Controller.createScreen);
router.get("/institute-list",upload.single("photo"), authentication.verifyToken,Controller.screensList);
router.post("/edit-institute",upload.single("photo"), authentication.verifyToken,Controller.EditScreen);
router.post("/delete-institute",authentication.verifyToken,Controller.deleteScreen);
////////////
router.get("/instructions",authentication.verifyToken,Controller.instructions);
router.get("/advertisement-list", authentication.verifyToken,Controller.advertisementList);
router.get("/institute-detail",upload.single("photo"), authentication.verifyToken,Controller.screenDetail);

/**********************************   Earner Api's ******************************************/

module.exports = router;
