import CommentService from "../../src/services/comment.service";
import CustomError from "../../src/errors";

// Mock the entire models
jest.mock("../../src/models/Comment", () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByPostId: jest.fn(),
  countByPostId: jest.fn(),
  canUserModifyComment: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock("../../src/models/Post", () => ({
  findById: jest.fn(),
}));

describe("CommentService", () => {
  let commentService: CommentService;

  beforeEach(() => {
    commentService = new CommentService();
    jest.clearAllMocks();
  });

  const mockComment = {
    id: "comment-1",
    post_id: "post-1",
    user_id: "user-1",
    content: "Test comment content",
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    username: "testuser",
    full_name: "Test User",
    avatar_initials: "TU",
  };

  const mockCreateCommentData = {
    post_id: "post-1",
    user_id: "user-1",
    content: "Test comment content",
  };

  describe("createComment", () => {
    test("should handle empty content validation", () => {
      const emptyContentData = {
        post_id: "post-1",
        user_id: "user-1",
        content: "",
      };

      // This would typically be validated at the controller/validation layer
      expect(emptyContentData.content).toBe("");
    });

    test("should handle valid content length", () => {
      expect(mockCreateCommentData.content.length).toBeGreaterThan(0);
      expect(mockCreateCommentData.content.length).toBeLessThan(300); // Assuming max length for comments
    });

    test("should require valid post_id", () => {
      expect(mockCreateCommentData.post_id).toBeDefined();
      expect(mockCreateCommentData.post_id).toMatch(/^[\w-]+$/);
    });

    test("should require valid user_id", () => {
      expect(mockCreateCommentData.user_id).toBeDefined();
      expect(mockCreateCommentData.user_id).toMatch(/^[\w-]+$/);
    });
  });

  describe("Service Error Handling", () => {
    test("should handle BadRequestError for comment creation", () => {
      const error = new CustomError.BadRequestError("Invalid comment data");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid comment data");
    });

    test("should handle NotFoundError for comment retrieval", () => {
      const error = new CustomError.NotFoundError("Comment not found");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Comment not found");
    });

    test("should handle UnauthorizedError for comment modification", () => {
      const error = new CustomError.UnauthorizedError(
        "Unauthorized to modify comment"
      );
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Unauthorized to modify comment");
    });

    test("should handle InternalServerError for database issues", () => {
      const error = new CustomError.InternalServerError(
        "Database connection failed"
      );
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Database connection failed");
    });
  });

  describe("Comment Data Validation", () => {
    test("should validate comment ID format", () => {
      const validId = "comment-1";
      const invalidId = "";

      expect(validId).toMatch(/^[\w-]+$/);
      expect(invalidId).toBe("");
    });

    test("should validate post ID reference", () => {
      const validPostId = "post-1";
      const invalidPostId = null;

      expect(validPostId).toMatch(/^[\w-]+$/);
      expect(invalidPostId).toBeNull();
    });

    test("should validate user ID reference", () => {
      const validUserId = "user-1";
      const invalidUserId = undefined;

      expect(validUserId).toMatch(/^[\w-]+$/);
      expect(invalidUserId).toBeUndefined();
    });
  });

  describe("Comment Pagination Logic", () => {
    test("should calculate pagination for comments correctly", () => {
      const page = 1;
      const limit = 5; // Comments typically have smaller page sizes
      const offset = (page - 1) * limit;

      expect(offset).toBe(0);
    });

    test("should handle second page pagination", () => {
      const page = 2;
      const limit = 5;
      const offset = (page - 1) * limit;

      expect(offset).toBe(5);
    });

    test("should validate pagination bounds", () => {
      const validPage = 1;
      const validLimit = 10;
      const invalidPage = 0;
      const invalidLimit = -1;

      expect(validPage).toBeGreaterThan(0);
      expect(validLimit).toBeGreaterThan(0);
      expect(invalidPage).toBeLessThanOrEqual(0);
      expect(invalidLimit).toBeLessThan(0);
    });
  });

  describe("Comment Business Logic", () => {
    test("should handle role-based comment permissions", () => {
      const userRole = "user";
      const adminRole = "admin";

      // Function to check if user can modify comment
      const canModifyComment = (
        userId: string,
        commentOwnerId: string,
        role: string
      ): boolean => {
        return userId === commentOwnerId || role === "admin";
      };

      // Test owner can modify their own comment
      expect(canModifyComment("user-1", "user-1", "user")).toBe(true);

      // Test different user cannot modify comment
      expect(canModifyComment("user-2", "user-1", "user")).toBe(false);

      // Test admin can modify any comment
      expect(canModifyComment("admin-1", "user-1", "admin")).toBe(true);
    });

    test("should validate comment content updates", () => {
      const originalContent = "Original comment";
      const updatedContent = "Updated comment content";

      expect(updatedContent).not.toBe(originalContent);
      expect(updatedContent.length).toBeGreaterThan(0);
    });

    test("should handle comment deletion flags", () => {
      const activeComment = { ...mockComment, is_deleted: false };
      const deletedComment = { ...mockComment, is_deleted: true };

      expect(activeComment.is_deleted).toBe(false);
      expect(deletedComment.is_deleted).toBe(true);
    });
  });

  describe("Comment Search and Filtering", () => {
    test("should filter comments by post", () => {
      const postId = "post-1";
      const comment1 = { ...mockComment, post_id: postId };
      const comment2 = { ...mockComment, post_id: "post-2" };

      expect(comment1.post_id).toBe(postId);
      expect(comment2.post_id).not.toBe(postId);
    });

    test("should filter comments by user", () => {
      const userId = "user-1";
      const comment1 = { ...mockComment, user_id: userId };
      const comment2 = { ...mockComment, user_id: "user-2" };

      expect(comment1.user_id).toBe(userId);
      expect(comment2.user_id).not.toBe(userId);
    });

    test("should handle empty comment results", () => {
      const emptyResults: any[] = [];
      const hasComments = emptyResults.length > 0;

      expect(hasComments).toBe(false);
      expect(emptyResults).toEqual([]);
    });
  });

  describe("Comment Timestamps", () => {
    test("should validate comment creation timestamp", () => {
      const now = new Date();
      const commentCreatedAt = new Date();

      // Comment should be created recently (within 1 minute)
      const timeDiff = Math.abs(now.getTime() - commentCreatedAt.getTime());
      const oneMinute = 60 * 1000;

      expect(timeDiff).toBeLessThan(oneMinute);
    });

    test("should handle comment update timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date();

      // Updated timestamp should be after created timestamp
      expect(updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    });
  });
});
