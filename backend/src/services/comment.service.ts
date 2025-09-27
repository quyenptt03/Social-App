import CommentModel, {
  CreateCommentData,
  UpdateCommentData,
  IComment,
} from "../models/Comment";
import PostModel from "../models/Post";
import Errors from "../errors";

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} = Errors;

class CommentService {
  // Create a new comment
  async createComment(commentData: CreateCommentData): Promise<IComment> {
    try {
      const comment = await CommentModel.create(commentData);

      // Get the full comment data with user info
      const fullComment = await CommentModel.findById(comment.id);
      if (!fullComment) {
        throw new InternalServerError("Failed to retrieve created comment");
      }

      return fullComment;
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new BadRequestError(error.message || "Failed to create comment");
    }
  }

  // Get comments for a post
  async getCommentsByPostId(
    post_id: string,
    page = 1,
    limit = 10
  ): Promise<{
    comments: IComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      // First check if post exists
      const post = await PostModel.findById(post_id);
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      const offset = (page - 1) * limit;

      // Get comments with one extra to check if there are more
      const comments = await CommentModel.findByPostId(
        post_id,
        limit + 1,
        offset
      );

      const hasMore = comments.length > limit;
      if (hasMore) {
        comments.pop(); // Remove the extra comment
      }

      return {
        comments,
        pagination: {
          page,
          limit,
          total: comments.length,
          hasMore,
        },
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to get comments");
    }
  }

  // Get a single comment by ID
  async getCommentById(id: string): Promise<IComment> {
    try {
      const comment = await CommentModel.findById(id);

      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      return comment;
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to get comment");
    }
  }

  // Get comments by user ID
  async getCommentsByUserId(
    user_id: string,
    page = 1,
    limit = 20
  ): Promise<{
    comments: IComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get comments with one extra to check if there are more
      const comments = await CommentModel.findByUserId(
        user_id,
        limit + 1,
        offset
      );

      const hasMore = comments.length > limit;
      if (hasMore) {
        comments.pop(); // Remove the extra comment
      }

      return {
        comments,
        pagination: {
          page,
          limit,
          total: comments.length,
          hasMore,
        },
      };
    } catch (error: any) {
      throw new InternalServerError(
        error.message || "Failed to get user comments"
      );
    }
  }

  // Update a comment
  async updateComment(
    id: string,
    user_id: string,
    updateData: UpdateCommentData,
    user_role: string
  ): Promise<IComment> {
    try {
      // Check if user can modify this comment
      const canModify = await CommentModel.canUserModifyComment(
        id,
        user_id,
        user_role
      );
      if (!canModify) {
        throw new UnauthorizedError("Unauthorized to update this comment");
      }

      const updatedComment = await CommentModel.updateById(
        id,
        user_id,
        updateData,
        user_id
      );

      if (!updatedComment) {
        throw new NotFoundError("Comment not found or already deleted");
      }

      // Get the full updated comment data with user info
      const fullComment = await CommentModel.findById(id);
      if (!fullComment) {
        throw new InternalServerError("Failed to retrieve updated comment");
      }

      return fullComment;
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new BadRequestError(error.message || "Failed to update comment");
    }
  }

  // Delete a comment
  async deleteComment(
    id: string,
    user_id: string,
    user_role: string
  ): Promise<boolean> {
    try {
      // Check if user can modify this comment
      const canModify = await CommentModel.canUserModifyComment(
        id,
        user_id,
        user_role
      );
      if (!canModify) {
        throw new UnauthorizedError("Unauthorized to delete this comment");
      }

      const deleted_by = user_role === "admin" ? user_id : undefined;
      const success = await CommentModel.softDeleteById(
        id,
        user_id,
        deleted_by
      );

      if (!success) {
        throw new NotFoundError("Comment not found or already deleted");
      }

      return true;
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new InternalServerError(
        error.message || "Failed to delete comment"
      );
    }
  }

  // Get comment count for a post
  async getCommentCount(post_id: string): Promise<number> {
    try {
      // First check if post exists
      const post = await PostModel.findById(post_id);
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      return await CommentModel.getCommentCount(post_id);
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new InternalServerError(
        error.message || "Failed to get comment count"
      );
    }
  }
}

export default CommentService;
