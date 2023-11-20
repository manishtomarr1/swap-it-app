import { unlinkSync } from "fs";
import users from "../modals/user.js";
import bcrypt from "bcryptjs";
import * as config from "../config.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";


const tokenAndUserResponse = (req, res, user) => {
  //TODO what is token?
  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    token,
    user,
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1. find user by email
    const user = await users.findOne({ email });

    if (!user) {
      return res.json({ error: "no user found! please register" });
    }

    // Check if the user object has a password property
    if (!user.password) {
      return res
        .status(401)
        .json({ message: "User does not have a password set" });
    }

    // 2. compare password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "incorrect password" });
    }

    // 3. create jwt tokens
    tokenAndUserResponse(req, res, user);
  } catch (err) {
    console.log(err);
    return res.json({ error: "something went wrong! Try again." });
  }
};

export const uploadImage = async (req, res) => {
  try {
    console.log(req.body, ">>>>>>>>>>>>>>>>>>>api call");
    const { image } = req.body;
    const base64Image = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    //image params

    const params = {
      //* params we nee dto upload to s3
      Bucket: "swapitbucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    config.S_3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        console.log(data);
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "upload failed! try again." });
  }
};

export const deleteImage = (req, res) => {
  console.log("api hit")
  console.log(req.body,":>>>body")
  try {
    const { Key, Bucket } = req.body;
    config.S_3.deleteObject({ Bucket, Key }, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.send({ ok: true });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

//     const { filename } = req.params;

//     if (!filename) {
//       return res.status(400).json({ message: 'Invalid filename' });
//     }

//     const imagePath = `uploads/${filename}`;

//     // Attempt to delete the image file
//     try {
//       unlinkSync(imagePath);
//       res.json({ message: 'Image deleted successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Failed to delete the image' });
//     }
//   };

export const userSignup = async (req, res) => {
  console.log("api call");
  const {
    firstName,
    email,
    phone,
    gender,
    location,
    photo,
    password,
    userLatitude,
    userLongitude,
  } = req.body;
  console.log(photo.Location, "imageLink>>>>>>>>>>>>>>?????????????");
  try {
    // Check if the user already exists with the same email
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash the user's password using bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10); // Adjust the number of salt rounds as needed

    const newUser = new users({
      name: firstName,
      email,
      gender,
      mobileNumber: phone,
      location: {
        type: "Point",
        coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)], // Set latitude and longitude
      },
      city: location,
      profilePicture: photo.Location,
      password: hashedPassword, // Store the hashed password
    });
    console.log(newUser, "new user???????????????");
    await newUser.save();

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "User registration failed" });
  }
};


export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log("=======", req.user);
    // console.log("password that go to server from auth.js", password)

    if (!password) {
      return res.json({ error: "password is requried" });
    }
    if (password && password?.length < 6) {
      return res.json({ error: "password should be min 6 charactor" });
    }
    // const user = await User.findById(req.user._id);

    const user = await users.findByIdAndUpdate(req.body.userId, {
      password: await hashPassword(password),
    });
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "unauthorize" });
  }
};