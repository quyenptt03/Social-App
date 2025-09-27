import { Router } from "express";
import PostController from "../controllers/post";
import { authenticateUser, requireAdmin } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const postController = new PostController();

// Validation schemas
const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Content is required")
      .max(1000, "Content cannot be more than 1000 characters")
      .trim(),
  }),
});

const updatePostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Content is required")
      .max(1000, "Content cannot be more than 1000 characters")
      .trim(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
});

const postIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
});

const userPostsSchema = z.object({
  params: z.object({
    user_id: z.string().uuid("Invalid user ID format"),
  }),
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    })
    .optional(),
});

const searchPostsSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 20)),
  }),
});

const postWithCommentsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
  query: z
    .object({
      comment_page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      comment_limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    })
    .optional(),
});

const timelineSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    })
    .optional(),
});

// Public routes
router.get(
  "/timeline",
  validateRequest(timelineSchema),
  postController.getTimeline
);
router.get(
  "/search",
  validateRequest(searchPostsSchema),
  postController.searchPosts
);
router.get("/:id", validateRequest(postIdSchema), postController.getPostById);
router.get(
  "/:id/comments",
  validateRequest(postWithCommentsSchema),
  postController.getPostWithComments
);
router.get(
  "/user/:user_id",
  validateRequest(userPostsSchema),
  postController.getPostsByUserId
);

// Protected routes (require authentication)
router.post(
  "/",
  authenticateUser,
  validateRequest(createPostSchema),
  postController.createPost
);
router.put(
  "/:id",
  authenticateUser,
  validateRequest(updatePostSchema),
  postController.updatePost
);
router.delete(
  "/:id",
  authenticateUser,
  validateRequest(postIdSchema),
  postController.deletePost
);

// Admin only routes
router.get(
  "/admin/timeline",
  authenticateUser,
  requireAdmin,
  validateRequest(timelineSchema),
  postController.getAdminTimeline
);
router.get(
  "/admin/deleted",
  authenticateUser,
  requireAdmin,
  validateRequest(timelineSchema),
  postController.getDeletedPosts
);

export default router;
