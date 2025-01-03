import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import vpnDetection from "./middlewares/vpnDetection.js";
import path from "path";
import { vpnRouter } from "./routes/vpn.routes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// VPN Detection middleware
app.use(vpnDetection);

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/vpn", vpnRouter);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Start server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server listening at port ${PORT}`);
});