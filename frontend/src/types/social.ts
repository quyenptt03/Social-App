export interface Post {
  id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  edited_by?: string;
  created_at: Date;
  updated_at: Date;
  // User info
  username?: string;
  full_name?: string;
  display_name?: string;
  avatar_initials?: string;
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  edited_by?: string;
  created_at: Date;
  updated_at: Date;
  // User info
  username?: string;
  full_name?: string;
  display_name?: string;
  avatar_initials?: string;
}

export interface CreatePostData {
  content: string;
}

export interface UpdatePostData {
  content: string;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
    pagination: PaginationInfo;
  };
}

export interface PostResponse {
  success: boolean;
  message: string;
  data: {
    post: Post;
  };
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    pagination: PaginationInfo;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    comment: Comment;
  };
}

export interface PostWithCommentsResponse {
  success: boolean;
  message: string;
  data: {
    post: Post;
    comments: Comment[];
    commentPagination: PaginationInfo;
  };
}
