import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { generateOTP, getOTPExpiry, sendOTPEmail } from "../utils/email.js";
import requestIp from "request-ip";
import axios from "axios";
import crypto from "crypto";
import UAParser from "ua-parser-js";
import { Flag } from "../models/flag.model.js";

async function checkIPReputation(ip) {
  try {
    // Skip check for localhost/development
    if (ip === "127.0.0.1" || ip === "::1") {
      return { risk: "low", score: 0 };
    }

    // Using AbuseIPDB API for IP reputation check
    const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
      },
      headers: {
        Key: "7fd9dc31aa0f53479d3a6d190d431c1caa74cd55551bec19a25b5d2ab0dc345c475957e19a00443f", // Replace with your API key
        Accept: "application/json",
      },
    });

    const data = response.data.data;
    const abuseScore = data.abuseConfidenceScore;

    // Calculate risk level based on abuse score
    let risk = "low";
    if (abuseScore > 80) {
      risk = "high";
    } else if (abuseScore > 40) {
      risk = "medium";
    }

    return {
      risk,
      score: abuseScore,
    };
  } catch (error) {
    console.error("IP reputation check error:", error);
    // Default to medium risk if the check fails
    return { risk: "medium", score: 50 };
  }
}

function generateDeviceFingerprint(req) {
  const ua = new UAParser(req.headers["user-agent"]);
  const deviceInfo = {
    browser: ua.getBrowser(),
    os: ua.getOS(),
    device: ua.getDevice(),
    screenResolution: req.headers["sec-ch-viewport-width"]
      ? `${req.headers["sec-ch-viewport-width"]}x${req.headers["sec-ch-viewport-height"]}`
      : "unknown",
    timezone: req.headers["time-zone"] || "unknown",
    language: req.headers["accept-language"] || "unknown",
    platform: ua.getEngine().name || "unknown",
  };

  // Create a unique device identifier
  const deviceString = JSON.stringify(deviceInfo);
  return crypto.createHash("sha256").update(deviceString).digest("hex");
}

async function getMyIp() {
  try {
    const response = await fetch("https://api.ipify.org");
    const ip = await response.text();
    return ip;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchGeolocation(ip) {
  try {
    if (ip === "127.0.0.1" || ip === "::1") {
      return { latitude: "00", longitude: `00` };
    }
    console.log(`Fetching geolocation data for IP address: ${ip}`);
    const response = await axios.get(
      `https://ipinfo.io/${ip}?token=5f4c260e6054f1`
    );
    console.log(`API response: ${response.data}`);
    const { loc } = response.data;

    if (!loc) {
      console.log(`No location data found for IP address: ${ip}`);
      return { latitude: "00", longitude: "00" };
    }

    const [latitude, longitude] = loc.split(",");
    return { latitude, longitude };
  } catch (error) {
    console.error("Geolocation fetch error:", error);
    return { latitude: "00", longitude: "00" };
  }
}

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Input validation
    if (!name || !username || !email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(401).json({
        message:
          existingUser.email === email
            ? "Email already taken"
            : "Username already taken",
        success: false,
      });
    }

    // Get user information
    // IP is getting fetched from the request

    //Doesnt work for localhost
    // const userIP = requestIp.getClientIp(req);

    const userIP = await getMyIp();
    const geoLocation = await fetchGeolocation(userIP);
    const IPReputation = await checkIPReputation(userIP);
    const deviceFingerPrint = generateDeviceFingerprint(req);

    // Generate OTP and hash password
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create initial Flag document
    const newFlag = new Flag({
      flaggedWords: [],
      positiveCount: 0,
      negativeCount: 0,
    });
    const savedFlag = await newFlag.save();

    // Create user with the flag reference
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      isMFAEnabled: true,
      otp,
      otpExpiresAt: otpExpiry,
      emailVerified: false,
      lastLoginIP: userIP,
      lastLoginLocation: geoLocation,
      isFlag: false,
      flagAddedAt: null,
      flagged: savedFlag._id, // Use the Flag document's ID instead of empty object
      IPReputation: IPReputation,
      deviceFingerPrint: deviceFingerPrint,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message:
        "Please verify your email with the OTP sent to your email address",
      userId: newUser._id.toString(),
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // More detailed error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid input data",
        errors: Object.values(error.errors).map((err) => err.message),
        success: false,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key error",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Error registering user",
      success: false,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already verified",
        success: false,
      });
    }

    if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired",
        success: false,
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    user.emailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error verifying email",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    // const userIP = requestIp.getClientIp(req);

    const userIP = await getMyIp();
    const geoLocation = await fetchGeolocation(userIP);

    // Get VPN status from the middleware
    const vpnStatus = req.vpnStatus || { isVpn: false };

    // Update user's VPN history and current status
    user.vpnHistory.push({
      isVpn: vpnStatus.isVpn,
      vpnProvider: vpnStatus.provider,
      confidenceScore: vpnStatus.confidence,
      ip: userIP,
      location: {
        city: geoLocation.place,
        region: geoLocation.latitude,
        country: geoLocation.longitude,
      },
    });

    user.currentVpnStatus = {
      isVpn: vpnStatus.isVpn,
      vpnProvider: vpnStatus.provider,
      detectedAt: new Date(),
      confidenceScore: vpnStatus.confidence,
    };

    if (user.isMFAEnabled) {
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      user.otp = otp;
      user.otpExpiresAt = otpExpiry;
      user.otpVerified = false;
      user.lastLoginIP = userIP;
      user.lastLoginLocation = geoLocation;
      await user.save();

      await sendOTPEmail(user.email, otp);

      return res.status(200).json({
        message: "OTP sent to your email",
        userId: user._id.toString(),
        requiresOTP: true,
        vpnDetected: vpnStatus.isVpn,
        success: true,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      "b4b68c9c73034fb7d3c9e5fcb9bcf156e43b8c95f34346e86fce70db70b8d4d4",
      { expiresIn: "1d" }
    );

    user.lastLoginIP = userIP;
    user.lastLoginLocation = geoLocation;
    await user.save();

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        vpnDetected: vpnStatus.isVpn,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
          currentVpnStatus: user.currentVpnStatus,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error during login",
      success: false,
    });
  }
};
export const verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired",
        success: false,
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    user.otp = null;
    user.otpExpiresAt = null;
    user.otpVerified = true;
    await user.save();

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error verifying OTP",
      success: false,
    });
  }
};

// Rest of your existing controller functions...
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKrunga = req.params.id;
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } else {
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "followed successfully", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};

export const resendLoginOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiresAt = otpExpiry;
    user.otpVerified = false;
    await user.save();

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      message: "New OTP sent to your email",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error sending OTP",
      success: false,
    });
  }
};

export const resendSignupOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiresAt = otpExpiry;
    await user.save();

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      message: "New OTP sent to your email",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error sending OTP",
      success: false,
    });
  }
};
