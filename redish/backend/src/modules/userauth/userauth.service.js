import pool from "../../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");

export const issueTokens = async (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  // jti makes every refresh token unique
  const refreshToken = jwt.sign(
    { id: userId, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '7 days')`,
    [userId, hash(refreshToken)]
  );

  return { accessToken, refreshToken };
};

export const registerNewUserService = async ({ name, email, password }) => {
  const exists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at",
      [name, email, hashedPassword]
    );
    return rows[0];
  } catch (error) {
    if (error.code === "23505") throw new Error("User already exists");
    throw error;
  }
};

export const logInUserService = async ({ email, password }) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  const tokens = await issueTokens(user.id);
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, ...tokens };
};

export const refreshService = async (oldToken) => {
  if (!oldToken) {
    throw new Error("Refresh token missing");
  }

  let payload;
  try {
    payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  // delete = single use (rotation)
  const { rowCount } = await pool.query(
    "DELETE FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()",
    [hash(oldToken)]
  );

  if (!rowCount) {
    // Valid signature but not in DB -> reuse attempt detected! Revoke all sessions for this user.
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [payload.id]);
    throw new Error("Refresh token reuse detected. Please log in again.");
  }

  return issueTokens(payload.id);
};

export const logoutService = async (token) => {
  if (token) {
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hash(token)]);
  }
};
