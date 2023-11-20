import express from "express";
import * as user from "../controllers/user.js";
import * as ad from "../controllers/ads.js"


const router = express.Router();




router.post('/uploadImage', user.uploadImage); 
router.post('/deleteImage', user.deleteImage);
router.post("/signUp", user.userSignup)
router.post("/login", user.login)



//ads
router.post("/uploadImages", ad.uploadImages)
// router.post("/deleteImages", ad.deleteImages)



router.post("/createAd", ad.create)
router.get('/userAds', ad.userAds)
router.get('/recentAds', ad.recentAds)
router.get('/highlyEnquired', ad.highlyEnquired)
router.get('/topRated', ad.highleyRated)
router.post('/addToWishlist', ad.addToWishlist)
router.post('/deleteFromWishlist', ad.deleteFromWishlist)
router.get('/wishlist', ad.wishlist)
router.get('/adDetails/:slug', ad.adDetails)
router.post('/addToEnquiry', ad.addToEnquried)
router.get('/enquried', ad.enquiredAds)
router.post('/sendMessage', ad.sendMessage)
router.get('/getChatHistory/:currentUserId', ad.getChatHistory)
router.post('/sendMessage', ad.sendMessage)
router.post('/sendSwapRequest', ad.sendSwapRequest)
router.get('/swapInfo/:userId', ad.getSwapRequest)
router.post('/confirmNotification/:userId', ad.confirmNotification)
router.post('/declineNotification/:userId', ad.declineNotification)
router.post('/updateProfile', ad.updateProfile)
router.post('/updatePassword', user.updatePassword)
router.post('/search', ad.search)
















export default router;
