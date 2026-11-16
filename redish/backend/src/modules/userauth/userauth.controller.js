import {
  registerNewUserService,
  logInUserService,
  refreshService,
  logoutService,
} from "./userauth.service.js";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
};

// 1. Register Controller
export const userregistercontroller = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const registeredUser = await registerNewUserService({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: registeredUser,
    });
  } catch (err) {
    const statusCode = err.message === "User already exists" ? 409 : 500;
    return res.status(statusCode).json({
      status: statusCode,
      message: err.message,
    });
  }
};

// 2. Login Controller
export const userLoginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, accessToken, refreshToken } = await logInUserService({
      email,
      password,
    });

   
    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: error.message || "Invalid credentials",
    });
  }
};

// 3. Refresh Token Controller
export const userRefreshTokenController = async (req, res) => {
  try {
    // Read refresh token from cookies or request body
    const oldRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        status: 401,
        message: "Refresh token is missing",
      });
    }

    const { accessToken, refreshToken } = await refreshService(oldRefreshToken);

    // Set rotated cookies
    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      message: "Tokens refreshed successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    // Clear cookies if refresh fails (e.g. reuse detected or expired)
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.status(403).json({
      status: 403,
      message: error.message || "Could not refresh token",
    });
  }
};

// 4. Logout Controller
export const userLogoutController = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      await logoutService(refreshToken);
    }

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.status(200).json({
      status: 200,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message || "Logout failed",
    });
  }
};

// 5. Get Current User Controller (Protected)
export const getMeController = async (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "Authenticated user fetched successfully",
    data: req.user,
  });
};
