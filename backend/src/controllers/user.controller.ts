import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { isValidEmail,isStrongPassword } from "../utils/validations";
import { AuthRequest } from "../middlewares/auth";
import { config } from "dotenv";
config();
const JWT_SECRET = process.env.JWT_SECRET!;


// Register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, useremail, password, role } = req.body;
  try {
   

    // 🔒 Basic Validations
    if (!username || username.length < 2) {
      res.status(400).json({ success: false,message: "username must be at least 2 characters long" });
      return;
    }
 
    if (!isValidEmail(useremail)) {
      res.status(400).json({success: false, message: "Invalid email format" });
      return;
    }

    if (!isStrongPassword(password)) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
       });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(409).json({ success: false, message: "Username already exists" });
      return;
    }

    const existingEmail = await User.findOne({ useremail });
    if (existingEmail) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const requestedRole = role ?? "student";


    const newUser = await User.create({
      username,
      useremail,
      password: hashedPassword,
      role:requestedRole,
      isApproved: requestedRole === "student", // Only students are auto-approved

    });

   
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        useremail: newUser.useremail,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.log("error");

    next(err);
  }
};


// Login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { useremail, password } = req.body;

    const user = await User.findOne({ useremail });

    if (!user) {
      res.status(401).json({success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({success: false, message: "Invalid credentials" }); return;
    }

    if (!user.isApproved) {
      res.status(403).json({success: false, message: "Your account is pending admin approval" });
      return;
    }
    

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        useremail:user.useremail,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};




export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, useremail, role } = req.body;


    // ✅ Validate email
    if (!isValidEmail(useremail)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    let user = await User.findOne({ useremail });

    if (!user) {
      // ✅ First-time Google login – create user with given/default role
      const requestedRole = role || "student";
      const autoApproved = requestedRole === "student";

      user = await User.create({
        username,
        useremail,
        role: requestedRole,
        isApproved: autoApproved,
      });
    }

    // ✅ Check approval for instructor/admin
    if (!user.isApproved) {
      res.status(403).json({ success: false, message: "Your account is pending admin approval" });
      return;
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};


export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction):Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
       res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};