import express from "express";
import { getInformationController, PostInformationController } from "./informationcontroller.js";
const route = express.Router();

route.post("/", PostInformationController)

route.get("/", getInformationController)


export default route