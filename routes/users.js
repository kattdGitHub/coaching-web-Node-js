const router = require(`express`).Router();
const adminAccount = require(`./admin/account`);
const adminApi = require(`./admin/api`);
const userAccount = require(`./user/account`);
const Advertiser = require(`./user/api/advertiser`);
const Institute = require(`./user/api/Institute`);
const course = require(`./user/api/course`);


router.use(`/v1/admin`, adminApi);
router.use(`/v1/admin`, adminAccount);
router.use(`/v1/user`, userAccount);
router.use(`/v1/user`, Advertiser);
router.use(`/v1/user`, Institute);
router.use(`/v1/user`, course);
module.exports = router;

