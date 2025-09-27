import { Request, Response } from "express";
import CommentService from "../services/comment.service";
import { CreateCommentData, UpdateCommentData } from "../models/Comment";
import { AuthenticatedRequest } from "../middleware/auth";
import Errors from "../errors";

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} = Errors;

class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  // Create a new comment
  createComment = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const { post_id, content } = req.body;

      if (!post_id || typeof post_id !== "string") {
        throw new BadRequestError("Post ID is required and must be a string");
      }

      if (!content || typeof content !== "string") {
        throw new BadRequestError("Content is required and must be a string");
      }

      const commentData: CreateCommentData = {
        post_id,
        user_id: req.user.userId,
        content: content.trim(),
      };

      const comment = await this.commentService.createComment(commentData);

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: { comment },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Get comments for a post
  getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { post_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!post_id) {
        throw new BadRequestError("Post ID is required");
      }

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 50) {
        throw new BadRequestError("Limit must be between 1 and 50");
      }

      const result = await this.commentService.getCommentsByPostId(
        post_id,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: "Comments fetched successfully",
        data: result,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Get a single comment by ID
  getCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Comment ID is required");
      }

      const comment = await this.commentService.getCommentById(id);

      res.status(200).json({
        success: true,
        message: "Comment fetched successfully",
        data: { comment },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Get comments by user ID
  getCommentsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!user_id) {
        throw new BadRequestError("User ID is required");
      }

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.commentService.getCommentsByUserId(
        user_id,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: "User comments fetched successfully",
        data: result,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Update a comment
  updateComment = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const { id } = req.params;
      const { content } = req.body;

      if (!id) {
        throw new BadRequestError("Comment ID is required");
      }

      if (!content || typeof content !== "string") {
        throw new BadRequestError("Content is required and must be a string");
      }

      const updateData: UpdateCommentData = {
        content: content.trim(),
      };

      const comment = await this.commentService.updateComment(
        id,
        req.user.userId,
        updateData,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: { comment },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Delete a comment
  deleteComment = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Comment ID is required");
      }

      const success = await this.commentService.deleteComment(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Get comment count for a post
  getCommentCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { post_id } = req.params;

      if (!post_id) {
        throw new BadRequestError("Post ID is required");
      }

      const count = await this.commentService.getCommentCount(post_id);

      res.status(200).json({
        success: true,
        message: "Comment count fetched successfully",
        data: { count },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };
}

export default CommentController;
