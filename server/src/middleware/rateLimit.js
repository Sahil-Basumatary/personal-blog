import rateLimit from "express-rate-limit";

const isTestEnv = process.env.NODE_ENV === "test";

const noopLimiter = (_req, _res, next) => next();

export const writeLimiter = isTestEnv
  ? noopLimiter
  : rateLimit({
      windowMs: 60 * 1000, 
      max: 20,       
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: "Too many write actions, please try again later.",
      },
    });

export const voteLimiter = isTestEnv
  ? noopLimiter
  : rateLimit({
      windowMs: 60 * 1000, 
      max: 60,             
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: "Too many votes, please relax.",
      },
    });