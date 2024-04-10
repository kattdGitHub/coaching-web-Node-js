const router = require(`express`).Router();
const adminAccount = require(`./admin/account`);
const adminApi = require(`./admin/api`);
const userAccount = require(`./user/account`);
const Advertiser = require(`./user/api/advertiser`);
const Earner = require(`./user/api/earner`);


router.use(`/v1/admin`, adminApi);
router.use(`/v1/admin`, adminAccount);
router.use(`/v1/user`, userAccount);
router.use(`/v1/advertiser`, Advertiser);
router.use(`/v1/earner`, Earner);
module.exports = router;

