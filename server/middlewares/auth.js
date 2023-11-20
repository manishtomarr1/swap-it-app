import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

//matlab hum kuch route kewal uneh user ko denge jo login honge like forgotpasword and all

export const requireSignin = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const decode = jwt.verify(token, JWT_SECRET, { expiresIn: "1h" });

    req.user = decode;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
