import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const validateEnv = (key) => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value.trim();
};

export const config = Object.freeze({
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: validateEnv("MONGODB_URI"),
  NODE_ENV: process.env.NODE_ENV || "development",
  CLOUD_NAME: validateEnv("CLOUD_NAME"),
  CLOUD_API_KEY: validateEnv("CLOUD_API_KEY"),
  CLOUD_API_SECRET: validateEnv("CLOUD_API_SECRET"),
  CORS_ORIGIN: validateEnv("CORS_ORIGIN"),
  ACCESS_TOKEN_SECRET_KEY: validateEnv("ACCESS_TOKEN_SECRET_KEY"),
  ACCESS_TOKEN_EXPIRY_IN: validateEnv("ACCESS_TOKEN_EXPIRY_IN"),
  REFRESH_TOKEN_SECRET_KEY: validateEnv("REFRESH_TOKEN_SECRET_KEY"),
  REFRESH_TOKEN_EXPIRY_IN: validateEnv("REFRESH_TOKEN_EXPIRY_IN"),
});
