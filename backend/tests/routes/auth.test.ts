import request from "supertest";
import express from "express";
import cors from "cors";
import { authRouter } from "../../src/routers";

// Create a minimal test app
const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Use auth router
  app.use("/api/v1/auth", authRouter);

  // Basic error handler
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  return app;
};

describe("Auth Routes Integration", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    process.env.JWT_SECRET = "test-jwt-secret-key";
  });

  describe("POST /api/v1/auth/register", () => {
    test("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        username: "testuser",
        // missing email, password, full_name
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        username: "testuser",
        email: "invalid-email",
        password: "password123",
        full_name: "Test User",
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for short password", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "123", // too short
        full_name: "Test User",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("should return 400 for missing credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        // missing password
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "",
        password: "password123",
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Route validation", () => {
    test("should return 404 for non-existent route", async () => {
      const response = await request(app).get("/api/v1/auth/nonexistent");

      expect(response.status).toBe(404);
    });

    test("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(400);
    });
  });
});
