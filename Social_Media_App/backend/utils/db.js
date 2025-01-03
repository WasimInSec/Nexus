import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file
dotenv.config();
const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);

    console.log("mongodb connected successfully.");
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
