import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import User from "./models/User.js";

const DEFAULT_ADMIN_EMAIL = "admin@servicemate.com";
const DEFAULT_ADMIN_PASSWORD = "12345678";
const DEFAULT_ADMIN_NAME = "ServiceMate Admin";

const ensureDefaultAdmin = async () => {
  const admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select("+password");

  if (!admin) {
    await User.create({
      fullName: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: "admin",
      isVerified: true,
      isActive: true,
    });
    return;
  }

  let shouldSave = false;
  if (admin.role !== "admin") {
    admin.role = "admin";
    shouldSave = true;
  }
  if (!admin.isVerified) {
    admin.isVerified = true;
    shouldSave = true;
  }
  if (!admin.isActive) {
    admin.isActive = true;
    shouldSave = true;
  }
  const passwordMatches = await admin.comparePassword(DEFAULT_ADMIN_PASSWORD);
  if (!passwordMatches) {
    admin.password = DEFAULT_ADMIN_PASSWORD;
    shouldSave = true;
  }

  if (shouldSave) {
    await admin.save();
  }
};

const startServer = async () => {
  try {
    await connectDB(env.mongodbUri);
    console.log("MongoDB connected");
    await ensureDefaultAdmin();
    console.log(`Default admin ready: ${DEFAULT_ADMIN_EMAIL}`);

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = () => {
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
