import { asyncHandler } from "../middleware/asyncHandler.js";

export const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ServiceMate API is running",
  });
});
