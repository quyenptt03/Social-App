import { Router } from "express";
import CommentController from "../controllers/comment";
import { authenticateUser } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const commentController = new CommentController();

// Validation schemas
const createCommentSchema = z.object({
  body: z.object({
    post_id: z.string().uuid("Invalid post ID format"),
    content: z
      .string()
      .min(1, "Content is required")
      .max(500, "Content cannot be more than 500 characters")
      .trim(),
  }),
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Content is required")
      .max(500, "Content cannot be more than 500 characters")
      .trim(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid comment ID format"),
  }),
});

const commentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid comment ID format"),
  }),
});

const postCommentsSchema = z.object({
  params: z.object({
    post_id: z.string().uuid("Invalid post ID format"),
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
        .transform((val) => (val ? parseInt(val) : 10)),
    })
    .optional(),
});

const userCommentsSchema = z.object({
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

const commentCountSchema = z.object({
  params: z.object({
    post_id: z.string().uuid("Invalid post ID format"),
  }),
});

// Public routes
router.get(
  "/post/:post_id",
  validateRequest(postCommentsSchema),
  commentController.getCommentsByPostId
);
router.get(
  "/post/:post_id/count",
  validateRequest(commentCountSchema),
  commentController.getCommentCount
);
router.get(
  "/user/:user_id",
  validateRequest(userCommentsSchema),
  commentController.getCommentsByUserId
);
router.get(
  "/:id",
  validateRequest(commentIdSchema),
  commentController.getCommentById
);

// Protected routes (require authentication)
router.post(
  "/",
  authenticateUser,
  validateRequest(createCommentSchema),
  commentController.createComment
);
router.put(
  "/:id",
  authenticateUser,
  validateRequest(updateCommentSchema),
  commentController.updateComment
);
router.delete(
  "/:id",
  authenticateUser,
  validateRequest(commentIdSchema),
  commentController.deleteComment
);

export default router;
