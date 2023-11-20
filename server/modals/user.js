import { model, Schema, ObjectId } from "mongoose";
import Ad from './ad.js'

const messageSchema = new Schema(
  {
    sender: { type: ObjectId, ref: "swapItUser" },
    receiver: { type: ObjectId, ref: "swapItUser" },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  }
);

const notificationSchema = new Schema({
  sender: { type: ObjectId, ref: "swapItUser" },
  inquiryAd: { type: ObjectId, ref: "swapItAd" }, // Ad on which the user sent an inquiry
  senderAd: { type: ObjectId, ref: "swapItAd" }, // Ad of the sender for swapping
  content: { type: String },
  timestamp: { type: Date, default: Date.now },
});


const swapItUserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    userType: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // Only "Point" type is allowed for GeoJSON
      },
      coordinates: [Number], // [longitude, latitude]
    },
    city: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    messages: [
     messageSchema
    ],
    notifications: [notificationSchema], 
    wishlist: [{ type: ObjectId, ref: "Ad" }],
    enquriedAds: [{ type: ObjectId, ref: "Ad" }],
  },

  { timestamps: true }
);

swapItUserSchema.index({ location: "2dsphere" });

export default model("swapItUser", swapItUserSchema);
 