var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require('../utils/connection');

var nftCreate = require('../controllers/nft');
var getNftList = require('../controllers/nft');
var getNftDetails = require('../controllers/nft');
var searchNFTValue = require('../controllers/nft');
var getCategory = require('../controllers/category');
var getHomePageImages = require('../controllers/category');
var getPaymentDetails = require('../controllers/category');

const admin = require('../controllers/admin/admin');

router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images');
    },
    filename: (req, file, cb) => {
      console.log(file.originalname);
      var filetype = '';
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      if(file.mimetype === 'video/mp4') {
        filetype = 'mp4';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});
var image = upload.fields([{ name: 'image', maxCount: 1 }])

router.post('/nftCreate' , image ,nftCreate.nftCreate.bind(this, db));
router.post('/getNftList',  getNftList.getNftList.bind(this, db));
router.post('/getNftDetails' , getNftDetails.getNftDetails.bind(this, db));
router.post('/searchNFTValue' , searchNFTValue.searchNFTValue.bind(this, db));
router.get('/getCategory' , getCategory.getCategory.bind(this, db));
router.get('/getHomePageImages' , getHomePageImages.getHomePageImages.bind(this, db));
router.get('/getPaymentDetails' , getPaymentDetails.getPaymentDetails.bind(this, db));
router.post('/nftgetTransactions' , nftCreate.nftgetTransactions.bind(this, db));

// Admin panel routing >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.post('/adminlogin', admin.login.bind(this, db));
router.post('/adminprofilepic', admin.getProfilePic.bind(this, db));
router.post('/updateprofilepicAdmin', admin.insertProfilePic.bind(this, db));
router.post('/adminpassword',admin.changePassword.bind(this, db));
router.get('/getSettingData',admin.getSettingData.bind(this, db));
router.post('/updateSetting',admin.updateSetting.bind(this, db));


module.exports = router;