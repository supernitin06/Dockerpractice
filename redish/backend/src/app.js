import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
import pool from "../config/db.js"




app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));





app.get("/", (req, res) => {
    res.send("<h1>Hello i am form</h1>")
})

export { app }