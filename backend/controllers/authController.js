import bcrypt from "bcryptjs";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    if (user.role !== role) {
      // Capitalize first letter of role for nicer display
      const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      return res.status(400).json({ message: `Account exists, but is registered as ${displayRole}.` });
    }

    // Check if the user signed up via Google and has no password
    if (!user.password) {
      return res.status(400).json({ message: "Please sign in using Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, log them in
      return res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // User doesn't exist, create temporary registration token
      const registrationToken = jwt.sign(
        { email, name, googleId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      return res.json({ 
        requireRole: true, 
        registrationToken 
      });
    }
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google Authentication failed" });
  }
};

// GOOGLE COMPLETE REGISTRATION (AFTER ROLE SELECTION)
export const googleCompleteRegistration = async (req, res) => {
  try {
    const { registrationToken, role } = req.body;
    
    if (!registrationToken || !role) {
      return res.status(400).json({ message: "Missing token or role" });
    }
    
    // Validate role
    if (!["admin", "recruiter", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    // Verify the temporary registration token
    const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    const { email, name, googleId } = decoded;
    
    // Double check user doesn't exist just in case
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already registered" });
    }
    
    // Create new user
    user = await User.create({
      name,
      email,
      googleId,
      role
    });
    
    // Send final login token
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error("Google Registration Complete Error:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Registration session expired. Please try Google login again." });
    }
    res.status(500).json({ message: "Server error during registration completion" });
  }
};
