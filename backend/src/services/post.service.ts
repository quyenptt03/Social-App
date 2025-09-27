import PostModel, {
  CreatePostData,
  UpdatePostData,
  IPost,
} from "../models/Post";
import CommentModel from "../models/Comment";
import Errors from "../errors";

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} = Errors;

class PostService {
  // Create a new post
  async createPost(postData: CreatePostData): Promise<IPost> {
    try {
      const post = await PostModel.create(postData);

      // Get the full post data with user info
      const fullPost = await PostModel.findById(post.id);
      if (!fullPost) {
        throw new InternalServerError("Failed to retrieve created post");
      }

      return fullPost;
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      throw new BadRequestError(error.message || "Failed to create post");
    }
  }

  // Get timeline posts for home page
  async getTimeline(
    page = 1,
    limit = 12
  ): Promise<{
    posts: IPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get posts with one extra to check if there are more
      const posts = await PostModel.getTimeline(limit + 1, offset);

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      return {
        posts,
        pagination: {
          page,
          limit,
          total: posts.length,
          hasMore,
        },
      };
    } catch (error: any) {
      throw new InternalServerError(error.message || "Failed to get timeline");
    }
  }

  // Get a single post by ID
  async getPostById(id: string): Promise<IPost> {
    try {
      const post = await PostModel.findById(id);

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      return post;
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to get post");
    }
  }

  // Get posts by user ID
  async getPostsByUserId(
    user_id: string,
    page = 1,
    limit = 12
  ): Promise<{
    posts: IPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get posts with one extra to check if there are more
      const posts = await PostModel.findByUserId(user_id, limit + 1, offset);

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      return {
        posts,
        pagination: {
          page,
          limit,
          total: posts.length,
          hasMore,
        },
      };
    } catch (error: any) {
      throw new InternalServerError(
        error.message || "Failed to get user posts"
      );
    }
  }

  // Update a post
  async updatePost(
    id: string,
    user_id: string,
    updateData: UpdatePostData,
    user_role: string
  ): Promise<IPost> {
    try {
      // Check if user can modify this post
      const canModify = await PostModel.canUserModifyPost(
        id,
        user_id,
        user_role
      );
      if (!canModify) {
        throw new UnauthorizedError("Unauthorized to update this post");
      }

      const updatedPost = await PostModel.updateById(
        id,
        user_id,
        updateData,
        user_id
      );

      if (!updatedPost) {
        throw new NotFoundError("Post not found or already deleted");
      }

      // Get the full updated post data with user info
      const fullPost = await PostModel.findById(id);
      if (!fullPost) {
        throw new InternalServerError("Failed to retrieve updated post");
      }

      return fullPost;
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to update post");
    }
  }

  // Delete a post
  async deletePost(
    id: string,
    user_id: string,
    user_role: string
  ): Promise<boolean> {
    try {
      // Check if user can modify this post
      const canModify = await PostModel.canUserModifyPost(
        id,
        user_id,
        user_role
      );
      if (!canModify) {
        throw new UnauthorizedError("Unauthorized to delete this post");
      }

      const deleted_by = user_role === "admin" ? user_id : undefined;
      const success = await PostModel.softDeleteById(id, user_id, deleted_by);

      if (!success) {
        throw new NotFoundError("Post not found or already deleted");
      }

      return true;
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to delete post");
    }
  }

  // Search posts
  async searchPosts(
    searchTerm: string,
    page = 1,
    limit = 12
  ): Promise<{
    posts: IPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new BadRequestError("Search term is required");
      }

      const offset = (page - 1) * limit;

      // Get posts with one extra to check if there are more
      const posts = await PostModel.search(
        searchTerm.trim(),
        limit + 1,
        offset
      );

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      return {
        posts,
        pagination: {
          page,
          limit,
          total: posts.length,
          hasMore,
        },
      };
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(error.message || "Failed to search posts");
    }
  }

  // Get post with comments
  async getPostWithComments(
    post_id: string,
    comment_page = 1,
    comment_limit = 10
  ): Promise<{ post: IPost; comments: any[]; commentPagination: any }> {
    try {
      // Get the post
      const post = await this.getPostById(post_id);

      // Get comments for the post
      const comment_offset = (comment_page - 1) * comment_limit;
      const comments = await CommentModel.findByPostId(
        post_id,
        comment_limit + 1,
        comment_offset
      );

      const hasMoreComments = comments.length > comment_limit;
      if (hasMoreComments) {
        comments.pop(); // Remove the extra comment
      }

      return {
        post,
        comments,
        commentPagination: {
          page: comment_page,
          limit: comment_limit,
          total: comments.length,
          hasMore: hasMoreComments,
        },
      };
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(
        error.message || "Failed to get post with comments"
      );
    }
  }

  // Get deleted posts (Admin only)
  async getDeletedPosts(
    page = 1,
    limit = 12
  ): Promise<{
    posts: IPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get deleted posts with one extra to check if there are more
      const posts = await PostModel.findDeleted(limit + 1, offset);

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      return {
        posts,
        pagination: {
          page,
          limit,
          total: posts.length,
          hasMore,
        },
      };
    } catch (error: any) {
      throw new InternalServerError(
        error.message || "Failed to get deleted posts"
      );
    }
  }

  // Get timeline including deleted posts for admins
  async getAdminTimeline(
    page = 1,
    limit = 12,
    includeDeleted = true
  ): Promise<{
    posts: IPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get posts with one extra to check if there are more
      const posts = await PostModel.findAll(limit + 1, offset, includeDeleted);

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      return {
        posts,
        pagination: {
          page,
          limit,
          total: posts.length,
          hasMore,
        },
      };
    } catch (error: any) {
      throw new InternalServerError(
        error.message || "Failed to get admin timeline"
      );
    }
  }
}

export default PostService;
