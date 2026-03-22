import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status,
    message: err.message || "Internal server error",
    ...(env.nodeEnv === "development" ? { stack: err.stack } : {}),
  });
};
