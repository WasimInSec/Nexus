import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
  cloud_name: "dzxgf75bh",
  api_key: "717325818898533",
  api_secret: "2hZvtoosYUuThtDHKkeSPXYTC5M",
});
export default cloudinary;
