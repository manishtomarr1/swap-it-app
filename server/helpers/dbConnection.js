import mongoose from "mongoose";
import 'dotenv/config'

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Welcome to MongoDB, you are connected with me");
  } catch (err) {
    console.log(err);
  }
}