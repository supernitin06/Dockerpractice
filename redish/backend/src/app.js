import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "../config/db.js";
import authRoutes from "./modules/userauth/userauth.routes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Auth Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("<h1>API Server Running</h1>");
});

export { app };
