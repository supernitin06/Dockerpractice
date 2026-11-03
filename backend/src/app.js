import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import informationroute from "./modules/Information/informationroute.js";
import otproute from "./modules/otp/index.js";
const app = express();



app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));


app.use("/api/information", informationroute);
app.use("/api/otp", otproute);



app.get("/", (req, res) => {
    res.send("<h1>Hello i am form</h1>")
})

export { app }