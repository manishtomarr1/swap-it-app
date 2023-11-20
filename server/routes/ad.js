import express from "express";
import * as ad from "../controllers/ads.js";
import multer from 'multer'; // Import multer

const router = express.Router();




router.post('/uploadImages', ad.uploadImages); 

export default router;
