import request from "supertest";
import express from "express";
import { authenticateUser } from "../../src/middleware/auth";
import { createJWT } from "../../src/utils/jwt";

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Test route that uses auth middleware
  app.get("/protected", authenticateUser, (req, res) => {
    res.json({
      success: true,
      userId: (req as any).user?.userId,
      username: (req as any).user?.username,
    });
  });

  return app;
};

describe("Auth Middleware", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    process.env.JWT_SECRET = "test-jwt-secret-key";
  });

  test("should allow access with valid token", async () => {
    const payload = { userId: "test-id", username: "testuser", role: "user" };
    const token = createJWT({ payload });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBe("test-id");
    expect(response.body.username).toBe("testuser");
  });

  test("should reject request without token", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
  });

  test("should reject request with invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid.token.here");

    expect(response.status).toBe(401);
  });

  test("should reject request with malformed Authorization header", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "InvalidFormat token");

    expect(response.status).toBe(401);
  });

  test("should reject request with token in wrong format", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "justtoken");

    expect(response.status).toBe(401);
  });
});
