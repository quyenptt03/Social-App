import { instance as axiosClient } from "../axiosClient";
import {
  Post,
  Comment,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  UpdateCommentData,
  PostsResponse,
  PostResponse,
  CommentsResponse,
  CommentResponse,
  PostWithCommentsResponse,
} from "../../types/social";

const API_BASE = "/api/v1";

// Post API functions
export const postApi = {
  // Get timeline posts (home page)
  getTimeline: async (page = 1, limit = 12): Promise<PostsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/timeline?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Create a new post
  createPost: async (postData: CreatePostData): Promise<PostResponse> => {
    const response = await axiosClient.post(`${API_BASE}/posts`, postData);
    return response.data;
  },

  // Get a single post by ID
  getPostById: async (id: string): Promise<PostResponse> => {
    const response = await axiosClient.get(`${API_BASE}/posts/${id}`);
    return response.data;
  },

  // Get post with comments
  getPostWithComments: async (
    id: string,
    commentPage = 1,
    commentLimit = 10
  ): Promise<PostWithCommentsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/${id}/comments?comment_page=${commentPage}&comment_limit=${commentLimit}`
    );
    return response.data;
  },

  // Get posts by user ID
  getPostsByUserId: async (
    userId: string,
    page = 1,
    limit = 12
  ): Promise<PostsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Update a post
  updatePost: async (
    id: string,
    postData: UpdatePostData
  ): Promise<PostResponse> => {
    const response = await axiosClient.put(`${API_BASE}/posts/${id}`, postData);
    return response.data;
  },

  // Delete a post
  deletePost: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete(`${API_BASE}/posts/${id}`);
    return response.data;
  },

  // Search posts
  searchPosts: async (
    query: string,
    page = 1,
    limit = 12
  ): Promise<PostsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Admin: Get timeline including deleted posts
  getAdminTimeline: async (
    page = 1,
    limit = 12,
    includeDeleted = true
  ): Promise<PostsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/admin/timeline?page=${page}&limit=${limit}&include_deleted=${includeDeleted}`
    );
    return response.data;
  },

  // Admin: Get deleted posts only
  getDeletedPosts: async (page = 1, limit = 12): Promise<PostsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/posts/admin/deleted?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Comment API functions
export const commentApi = {
  // Create a new comment
  createComment: async (
    commentData: CreateCommentData
  ): Promise<CommentResponse> => {
    const response = await axiosClient.post(
      `${API_BASE}/comments`,
      commentData
    );
    return response.data;
  },

  // Get comments for a post
  getCommentsByPostId: async (
    postId: string,
    page = 1,
    limit = 10
  ): Promise<CommentsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/comments/post/${postId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get a single comment by ID
  getCommentById: async (id: string): Promise<CommentResponse> => {
    const response = await axiosClient.get(`${API_BASE}/comments/${id}`);
    return response.data;
  },

  // Get comments by user ID
  getCommentsByUserId: async (
    userId: string,
    page = 1,
    limit = 20
  ): Promise<CommentsResponse> => {
    const response = await axiosClient.get(
      `${API_BASE}/comments/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Update a comment
  updateComment: async (
    id: string,
    commentData: UpdateCommentData
  ): Promise<CommentResponse> => {
    const response = await axiosClient.put(
      `${API_BASE}/comments/${id}`,
      commentData
    );
    return response.data;
  },

  // Delete a comment
  deleteComment: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete(`${API_BASE}/comments/${id}`);
    return response.data;
  },

  // Get comment count for a post
  getCommentCount: async (
    postId: string
  ): Promise<{
    success: boolean;
    message: string;
    data: { count: number };
  }> => {
    const response = await axiosClient.get(
      `${API_BASE}/comments/post/${postId}/count`
    );
    return response.data;
  },
};
