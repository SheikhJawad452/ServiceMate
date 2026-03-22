import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import xss from "xss-clean";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();
const normalizeOrigin = (value) => (value || "").replace(/\/+$/, "");
const configuredClientOrigin = normalizeOrigin(env.clientUrl || "http://localhost:5173");
const allowedOrigins = [configuredClientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1", routes);
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Welcome to ServiceMate API" });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
