import mongoose from "mongoose";

export const connectDB = async (mongodbUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongodbUri);
};
