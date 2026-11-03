import "dotenv/config";
import express from "express";
import Redis from "ioredis";

const router = express.Router();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.error("Redis error:", err);
});

const rediskey = (phone) => {
    return `otp:${phone}`;
};

router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }
        const Otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        await redis.set(rediskey(phone), Otp, "EX", 60);
        return res.status(200).json({ message: "otp sent successfully", Otp: Otp });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal server error" });
    }
});

router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, Otp } = req.body;
        if (!phone || !Otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        const storedOtp = await redis.get(rediskey(phone));
        if (!storedOtp) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }

        if (String(storedOtp) !== String(Otp)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await redis.del(rediskey(phone));

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal server error" });
    }
});

export default router;


