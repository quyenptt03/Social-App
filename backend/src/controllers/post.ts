import { Request, Response } from "express";
import PostService from "../services/post.service";
import { CreatePostData, UpdatePostData } from "../models/Post";
import { AuthenticatedRequest } from "../middleware/auth";
import Errors from "../errors";

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} = Errors;

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  // Create a new post
  createPost = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const { content } = req.body;

      if (!content || typeof content !== "string") {
        throw new BadRequestError("Content is required and must be a string");
      }

      const postData: CreatePostData = {
        user_id: req.user.userId,
        content: content.trim(),
      };

      const post = await this.postService.createPost(postData);

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: { post },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  };

  // Get timeline posts (home page)
  getTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.postService.getTimeline(page, limit);

      res.status(200).json({
        success: true,
        message: "Timeline fetched successfully",
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

  // Get a single post by ID
  getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Post ID is required");
      }

      const post = await this.postService.getPostById(id);

      res.status(200).json({
        success: true,
        message: "Post fetched successfully",
        data: { post },
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

  // Get post with comments
  getPostWithComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const comment_page = parseInt(req.query.comment_page as string) || 1;
      const comment_limit = parseInt(req.query.comment_limit as string) || 10;

      if (!id) {
        throw new BadRequestError("Post ID is required");
      }

      if (comment_page < 1) {
        throw new BadRequestError("Comment page must be greater than 0");
      }

      if (comment_limit < 1 || comment_limit > 50) {
        throw new BadRequestError("Comment limit must be between 1 and 50");
      }

      const result = await this.postService.getPostWithComments(
        id,
        comment_page,
        comment_limit
      );

      res.status(200).json({
        success: true,
        message: "Post with comments fetched successfully",
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

  // Get posts by user ID
  getPostsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      if (!user_id) {
        throw new BadRequestError("User ID is required");
      }

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.postService.getPostsByUserId(
        user_id,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: "User posts fetched successfully",
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

  // Update a post
  updatePost = async (
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
        throw new BadRequestError("Post ID is required");
      }

      if (!content || typeof content !== "string") {
        throw new BadRequestError("Content is required and must be a string");
      }

      const updateData: UpdatePostData = {
        content: content.trim(),
      };

      const post = await this.postService.updatePost(
        id,
        req.user.userId,
        updateData,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: { post },
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

  // Delete a post
  deletePost = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Post ID is required");
      }

      const success = await this.postService.deletePost(
        id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
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

  // Search posts
  searchPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      if (!q || typeof q !== "string") {
        throw new BadRequestError("Search query 'q' is required");
      }

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.postService.searchPosts(q, page, limit);

      res.status(200).json({
        success: true,
        message: "Posts search completed successfully",
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

  // Get admin timeline (includes deleted posts)
  getAdminTimeline = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const includeDeleted = req.query.include_deleted !== "false";

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.postService.getAdminTimeline(
        page,
        limit,
        includeDeleted
      );

      res.status(200).json({
        success: true,
        message: "Admin timeline fetched successfully",
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

  // Get deleted posts (Admin only)
  getDeletedPosts = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      if (page < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const result = await this.postService.getDeletedPosts(page, limit);

      res.status(200).json({
        success: true,
        message: "Deleted posts fetched successfully",
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
}

export default PostController;
