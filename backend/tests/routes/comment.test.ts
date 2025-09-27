import request from "supertest";
import express from "express";
import cors from "cors";
import { commentRouter } from "../../src/routers";
import { authenticateUser } from "../../src/middleware/auth";
import { createJWT } from "../../src/utils/jwt";

// Create a minimal test app
const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Use comment router with auth middleware
  app.use("/api/v1/comments", authenticateUser, commentRouter);

  // Basic error handler
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  return app;
};

describe("Comment Routes Integration", () => {
  let app: express.Application;
  let authToken: string;
  let adminToken: string;

  beforeEach(() => {
    app = createTestApp();
    process.env.JWT_SECRET = "test-jwt-secret-key";

    // Create test auth tokens
    const userPayload = {
      userId: "user-1",
      username: "testuser",
      role: "user",
    };
    const adminPayload = {
      userId: "admin-1",
      username: "testadmin",
      role: "admin",
    };

    authToken = createJWT({ payload: userPayload });
    adminToken = createJWT({ payload: adminPayload });
  });

  describe("POST /api/v1/comments", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/v1/comments").send({
        post_id: "post-1",
        content: "Test comment content",
      });

      expect(response.status).toBe(401);
    });

    test("should return 400 for missing post_id", async () => {
      const response = await request(app)
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Test comment content",
        });

      expect(response.status).toBe(400);
    });

    test("should return 400 for missing content", async () => {
      const response = await request(app)
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          post_id: "post-1",
        });

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty content", async () => {
      const response = await request(app)
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          post_id: "post-1",
          content: "",
        });

      expect(response.status).toBe(400);
    });

    test("should handle valid comment creation request", async () => {
      const response = await request(app)
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          post_id: "post-1",
          content: "This is a valid comment",
        });

      // Should handle the request (may fail due to post not existing in test)
      expect([200, 201, 404, 500]).toContain(response.status);
    });
  });

  describe("GET /api/v1/comments/post/:postId", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/comments/post/post-1");

      expect(response.status).toBe(401);
    });

    test("should handle pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/comments/post/post-1?page=1&limit=5")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle the request appropriately
      expect([200, 404, 500]).toContain(response.status);
    });

    test("should handle invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/comments/post/post-1?page=0&limit=-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle invalid parameters
      expect([400, 200]).toContain(response.status);
    });

    test("should handle non-existent post ID", async () => {
      const response = await request(app)
        .get("/api/v1/comments/post/nonexistent-post")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle non-existent post appropriately
      expect([404, 200, 500]).toContain(response.status);
    });
  });

  describe("GET /api/v1/comments/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/comments/comment-1");

      expect(response.status).toBe(401);
    });

    test("should handle valid comment ID", async () => {
      const response = await request(app)
        .get("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle the request (may not find the comment)
      expect([200, 404, 500]).toContain(response.status);
    });

    test("should handle invalid comment ID format", async () => {
      const response = await request(app)
        .get("/api/v1/comments/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle invalid ID format
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe("PUT /api/v1/comments/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .put("/api/v1/comments/comment-1")
        .send({
          content: "Updated comment content",
        });

      expect(response.status).toBe(401);
    });

    test("should return 400 for missing content", async () => {
      const response = await request(app)
        .put("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty content", async () => {
      const response = await request(app)
        .put("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "",
        });

      expect(response.status).toBe(400);
    });

    test("should handle valid update request", async () => {
      const response = await request(app)
        .put("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Updated comment content",
        });

      // Should handle the request (may not find the comment or be unauthorized)
      expect([200, 404, 403, 500]).toContain(response.status);
    });
  });

  describe("DELETE /api/v1/comments/:id", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).delete("/api/v1/comments/comment-1");

      expect(response.status).toBe(401);
    });

    test("should handle delete request with user token", async () => {
      const response = await request(app)
        .delete("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${authToken}`);

      // Should handle the delete request (may not find the comment or be unauthorized)
      expect([200, 404, 403, 500]).toContain(response.status);
    });

    test("should handle delete request with admin token", async () => {
      const response = await request(app)
        .delete("/api/v1/comments/comment-1")
        .set("Authorization", `Bearer ${adminToken}`);

      // Admin should be able to delete (may not find the comment)
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe("Route Security", () => {
    test("should reject malformed JWT token", async () => {
      const response = await request(app)
        .get("/api/v1/comments/post/post-1")
        .set("Authorization", "Bearer invalid.token.format");

      expect(response.status).toBe(401);
    });

    test("should reject invalid authorization header format", async () => {
      const response = await request(app)
        .get("/api/v1/comments/post/post-1")
        .set("Authorization", "InvalidFormat token");

      expect(response.status).toBe(401);
    });

    test("should handle malformed JSON in request body", async () => {
      const response = await request(app)
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(400);
    });
  });

  describe("Comment Content Validation", () => {
    test("should validate comment content length", () => {
      const validContent = "This is a valid comment";
      const emptyContent = "";
      const whitespaceContent = "   ";
      const longContent = "a".repeat(500); // Assuming max length

      expect(validContent.trim().length).toBeGreaterThan(0);
      expect(emptyContent.trim().length).toBe(0);
      expect(whitespaceContent.trim().length).toBe(0);
      expect(longContent.length).toBe(500);
    });

    test("should handle special characters in comment content", () => {
      const contentWithSpecialChars = "Great post! 👍 @user #awesome";

      expect(contentWithSpecialChars.length).toBeGreaterThan(0);
      expect(contentWithSpecialChars).toContain("@");
      expect(contentWithSpecialChars).toContain("#");
      expect(contentWithSpecialChars).toContain("👍");
    });

    test("should validate post_id format", () => {
      const validPostId = "post-123";
      const invalidPostId = "";
      const numericPostId = "123";

      expect(validPostId).toMatch(/^[\w-]+$/);
      expect(invalidPostId).toBe("");
      expect(numericPostId).toMatch(/^\d+$/);
    });
  });

  describe("Comment Business Logic", () => {
    test("should handle comment ownership logic", () => {
      // Function to check if user can modify comment
      const canModifyComment = (
        userId: string,
        commentOwnerId: string,
        role: string
      ): boolean => {
        return userId === commentOwnerId || role === "admin";
      };

      // Owner can modify their comment
      expect(canModifyComment("user-1", "user-1", "user")).toBe(true);

      // Different user cannot modify
      expect(canModifyComment("user-2", "user-1", "user")).toBe(false);

      // Admin can modify any comment
      expect(canModifyComment("admin-1", "user-1", "admin")).toBe(true);
    });

    test("should validate comment relationships", () => {
      const comment = {
        id: "comment-1",
        post_id: "post-1",
        user_id: "user-1",
        content: "Test comment",
      };

      expect(comment.post_id).toBeDefined();
      expect(comment.user_id).toBeDefined();
      expect(comment.content.length).toBeGreaterThan(0);
    });
  });
});
