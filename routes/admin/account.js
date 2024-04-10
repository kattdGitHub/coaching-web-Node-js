const express = require('express');
const router = express.Router();
const Controller = require('../../controller/admin/admin'); // Assuming your controller is defined in a separate file

const app = express(); // Define your Express app instance

//*********************************** Admin *********************/
router.post("/adminLogin", Controller.adminLogin);
router.post("/forgot-password", Controller.forgotPassword);
router.post("/update-password", Controller.updatePassword);
router.post("/logout", Controller.logOut);

module.exports = router;
