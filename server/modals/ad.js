import { model, Schema, ObjectId } from "mongoose";

const advertisementSchema = new Schema({
  photos: [
    {
      type: String, // You can store the image URL or use GridFS for image storage
    },
  ],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  importantFor: {
    type: String,
  },
  buyAt: {
    type: Date, // You can use the appropriate data type for your currency
  },
  preferItemsForSwapping: [
    {
      type: String,
    },
  ],
  location: {
    type: {
      type: String,
      enum: ['Point'], // Only allow 'Point' type for location
      required: true,
    },
    coordinates: {
      type: [Number], // Use an array of numbers for coordinates
      required: true,
    },
  },
  city: {
    type: String,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "swapItUser", // Reference the "SwapItUser" model
    required: true,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  totalEnquiry: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
  updatedAt: {
    type: Date,
  },
});

advertisementSchema.index({ coordinates: "2dsphere" }); // Create a geospatial index for coordinates

export default model("swapItAd", advertisementSchema);
