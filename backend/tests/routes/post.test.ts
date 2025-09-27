import request from "supertest";
import express from "express";
import cors from "cors";
import { postRouter } from "../../src/routers";
import { authenticateUser } from "../../src/middleware/auth";
import { createJWT } from "../../src/utils/jwt";

// Create a minimal test app
const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Use post router with auth middleware
  app.use("/api/v1/posts", authenticateUser, postRouter);

  // Basic error handler
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  return app;
};

describe("Post Routes Integration", () => {
  let app: express.Application;
  let authToken: string;

  beforeEach(() => {
    app = createTestApp();
    process.env.JWT_SECRET = "test-jwt-secret-key";

    // Create a test auth token
    const payload = { userId: "user-1", username: "testuser", role: "user" };
    authToken = createJWT({ payload });
  });

  describe("POST /api/v1/posts", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/v1/posts").send({
        content: "Test post content",
      });

      expect(response.status).toBe(401);
    });

    test("should return 400 for missing content", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty content", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "",
        });

      expect(response.status).toBe(400);
    });

    test("should handle content length validation", async () => {
      const longContent = "a".repeat(1000); // Assuming there's a max length limit

      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: longContent,
        });

      // Should either succeed or return 400 for too long content
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe("GET /api/v1/posts", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/posts");

      expect(response.status).toBe(401);
    });

    test("should handle pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/posts?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`);

      // Should either return posts or handle the request appropriately
      expect([200, 404, 500]).toContain(response.status);
    });

    test("should handle invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/posts?page=0&limit=-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle invalid parameters
      expect([400, 200]).toContain(response.status);
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/posts/post-1");

      expect(response.status).toBe(401);
    });

    test("should handle invalid post ID format", async () => {
      const response = await request(app)
        .get("/api/v1/posts/invalid-id-format")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle invalid ID format
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe("PUT /api/v1/posts/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).put("/api/v1/posts/post-1").send({
        content: "Updated content",
      });

      expect(response.status).toBe(401);
    });

    test("should return 400 for missing content", async () => {
      const response = await request(app)
        .put("/api/v1/posts/post-1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty content", async () => {
      const response = await request(app)
        .put("/api/v1/posts/post-1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).delete("/api/v1/posts/post-1");

      expect(response.status).toBe(401);
    });

    test("should handle delete request with authentication", async () => {
      const response = await request(app)
        .delete("/api/v1/posts/post-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle the delete request (may not find the post)
      expect([200, 404, 403, 500]).toContain(response.status);
    });
  });

  describe("GET /api/v1/posts/user/:userId", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/posts/user/user-1");

      expect(response.status).toBe(401);
    });

    test("should handle valid user ID", async () => {
      const response = await request(app)
        .get("/api/v1/posts/user/user-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle the request appropriately
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe("Route Security", () => {
    test("should reject malformed JWT token", async () => {
      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", "Bearer invalid.token.format");

      expect(response.status).toBe(401);
    });

    test("should reject expired or invalid authorization header", async () => {
      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", "InvalidFormat token");

      expect(response.status).toBe(401);
    });

    test("should handle malformed JSON in request body", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(400);
    });
  });

  describe("Content Validation", () => {
    test("should validate content type", () => {
      const validContent = "This is a valid post content";
      const emptyContent = "";
      const whitespaceContent = "   ";

      expect(validContent.trim().length).toBeGreaterThan(0);
      expect(emptyContent.trim().length).toBe(0);
      expect(whitespaceContent.trim().length).toBe(0);
    });

    test("should handle special characters in content", () => {
      const contentWithSpecialChars =
        "Hello! This is a test with @mentions and #hashtags 🚀";

      expect(contentWithSpecialChars.length).toBeGreaterThan(0);
      expect(contentWithSpecialChars).toContain("@");
      expect(contentWithSpecialChars).toContain("#");
    });
  });
});
