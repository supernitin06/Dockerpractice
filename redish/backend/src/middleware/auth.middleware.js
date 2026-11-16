import jwt from "jsonwebtoken";
import { refreshService } from "../modules/userauth/userauth.service.js";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
};

export const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  // 1. If accessToken is valid, pass immediately (No DB query!)
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Token expired? Fall through to check refreshToken below
    }
  }

  // 2. Access token expired or missing -> check refreshToken cookie
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      status: 401,
      message: "Authentication required. Please log in.",
    });
  }

  // 3. Silently refresh tokens in the backend!
  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await refreshService(refreshToken);

    // Set updated cookies in response
    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Attach user and allow the original request to proceed!
    req.user = jwt.decode(newAccessToken);
    return next();
  } catch (error) {
    // If refreshToken also expired or invalid -> force re-login
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(401).json({
      status: 401,
      message: "Session expired. Please log in again.",
    });
  }
};