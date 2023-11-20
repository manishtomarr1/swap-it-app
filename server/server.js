import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import adminModel from "./modals/admin.js";
import "dotenv/config";

const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
import { dbConnection } from "./helpers/dbConnection.js";
// Update the route to accept data

mongoose.set("strictQuery", false);
//middlewares
app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan("dev"));
app.use(cors());

const port = process.env.PORT || 9000;

//routes middlewares
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.json({
    data: "node.js welcome you! you are now connected with me.... ",
  });
});

async function createDefaultAdmin() {
    dbConnection();
    try {
      const existingAdmin = await adminModel.findOne({ userType: "Admin" });
      const email = process.env.EMAIL;
      const password = process.env.PASSWORD;
      if (existingAdmin) {
        console.log("Default Admin already exists.");
      } else {
        const obj = {
          userType: "Admin",
          firstName: "Manish",
          lastName: "Tomar",
          userName: "ManishTomar",
          countryCode: "+44",
          mobileNumber: "7407833185",
          email: email, // Correct the environment variable name
          password: bcrypt.hashSync(password), // Make sure PASSWORD is defined as well
        };
  
        // Check if a user with the same email already exists in "swapItAdmin"
        const findAdmin = await adminModel.findOne({ email: email });
        if (!findAdmin) {
          const result = await adminModel.create(obj); // Create a new document in "swapItAdmin"
          console.log("Default admin created.", result);
        } else {
          console.log("Default admin is already created 🔫🔫");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
createDefaultAdmin();
app.listen(port, () => {
  console.log(`Your app is running on port ${port}🔫`);
}); //!go to package.json create type:"module" by this we can us import export
