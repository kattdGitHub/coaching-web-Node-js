const express = require('express');
const router = express.Router();
const Controller = require('../../controller/admin/admin'); // Assuming your controller is defined in a separate file

const app = express(); // Define your Express app instance

//*********************************** User *********************/
router.get("/users-list", Controller.userList);
router.get("/total-data", Controller.totalData);
router.get("/delete-user", Controller.deleteUser);
router.get("/block-user", Controller.blockUncblockUser);

//*********************************** Advertisements  *********************/
router.get("/advertisements-list", Controller.advertisementsList);
router.get("/delete-advertisement", Controller.deleteAdvertisement);
router.get("/approve-advertisement", Controller.advertisementsApprove);

//*********************************** Screens  *********************/
router.get("/screens-list", Controller.screensList);
router.get("/delete-screen", Controller.deleteScreen);
router.get("/approve-screen", Controller.screenApprove);


//*********************************** updateInstruction  *********************/
router.post("/update-instruction", Controller.updateInstruction);
router.get("/get-instruction", Controller.getInstruction);

module.exports = router;

