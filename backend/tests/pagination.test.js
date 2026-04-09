import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const createQueryChain = (result) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(async () => result),
  };
  return chain;
};

describe("Pagination API tests", () => {
  let app;
  let getTechnicians;
  let getUserBookings;
  let getReviews;
  let Technician;
  let Booking;
  let Review;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/servicemate-test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

    ({ getTechnicians } = await import("../src/controllers/technician/technicianController.js"));
    ({ getUserBookings } = await import("../src/controllers/booking/bookingController.js"));
    ({ getReviews } = await import("../src/controllers/review/reviewController.js"));
    ({ default: Technician } = await import("../src/models/Technician.js"));
    ({ default: Booking } = await import("../src/models/Booking.js"));
    ({ default: Review } = await import("../src/models/Review.js"));
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get("/api/v1/technicians", getTechnicians);
    app.get("/api/v1/reviews", getReviews);
    app.get(
      "/api/v1/bookings/user",
      (req, res, next) => {
        req.user = { _id: "user-1", role: "user" };
        next();
      },
      getUserBookings,
    );

    jest.restoreAllMocks();
  });

  test("default pagination exists on /technicians", async () => {
    const technicians = [{ _id: "t1" }, { _id: "t2" }, { _id: "t3" }];
    jest.spyOn(Technician, "find").mockImplementation(() => createQueryChain(technicians));
    jest.spyOn(Technician, "countDocuments").mockResolvedValue(23);

    const response = await request(app).get("/api/v1/technicians");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(10);
  });

  test("custom page and limit works on /technicians", async () => {
    const technicians = [{ _id: "t11" }, { _id: "t12" }];
    jest.spyOn(Technician, "find").mockImplementation(() => createQueryChain(technicians));
    jest.spyOn(Technician, "countDocuments").mockResolvedValue(12);

    const response = await request(app).get("/api/v1/technicians?page=2&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.pagination.totalPages).toBe(
      Math.ceil(response.body.pagination.total / response.body.pagination.limit),
    );
  });

  test("large page number does not crash", async () => {
    jest.spyOn(Technician, "find").mockImplementation(() => createQueryChain([]));
    jest.spyOn(Technician, "countDocuments").mockResolvedValue(12);

    const response = await request(app).get("/api/v1/technicians?page=999&limit=10");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  test("invalid page/limit falls back to safe defaults", async () => {
    const technicians = [{ _id: "t1" }];
    jest.spyOn(Technician, "find").mockImplementation(() => createQueryChain(technicians));
    jest.spyOn(Technician, "countDocuments").mockResolvedValue(1);

    const response = await request(app).get("/api/v1/technicians?page=-1&limit=0");

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
  });

  test("default pagination exists on /bookings/user", async () => {
    const bookings = [{ _id: "b1", status: "Pending" }];
    jest.spyOn(Booking, "find").mockImplementation(() => createQueryChain(bookings));
    jest.spyOn(Booking, "countDocuments").mockResolvedValue(1);

    const response = await request(app).get("/api/v1/bookings/user");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.data.length).toBeLessThanOrEqual(10);
  });

  test("default pagination exists on /reviews", async () => {
    const reviews = [{ _id: "r1", rating: 5 }];
    jest.spyOn(Review, "find").mockImplementation(() => createQueryChain(reviews));
    jest.spyOn(Review, "countDocuments").mockResolvedValue(1);

    const response = await request(app).get("/api/v1/reviews");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.data.length).toBeLessThanOrEqual(10);
  });
});
