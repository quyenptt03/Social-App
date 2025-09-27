import { query } from "../db/connect";

export interface IComment {
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
  // Joined fields from user
  username?: string;
  full_name?: string;
  display_name?: string;
  avatar_initials?: string;
}

export interface CreateCommentData {
  post_id: string;
  user_id: string;
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

class CommentModel {
  // Validation methods
  static validateContent(content: string): void {
    if (!content) {
      throw new Error("Comment content is required");
    }
    if (content.length > 500) {
      throw new Error("Comment content cannot be more than 500 characters");
    }
    if (content.trim().length < 1) {
      throw new Error("Comment content cannot be empty");
    }
  }

  // Create a new comment
  static async create(commentData: CreateCommentData): Promise<IComment> {
    const { post_id, user_id, content } = commentData;

    // Validate content
    this.validateContent(content);

    if (!post_id) {
      throw new Error("Post ID is required");
    }
    if (!user_id) {
      throw new Error("User ID is required");
    }

    try {
      // First check if post exists and is not deleted
      const postExists = await query(
        "SELECT id FROM posts WHERE id = $1 AND is_deleted = false",
        [post_id]
      );

      if (!postExists.rows[0]) {
        throw new Error("Post not found or has been deleted");
      }

      const result = await query(
        `INSERT INTO comments (post_id, user_id, content) 
         VALUES ($1, $2, $3) 
         RETURNING id, post_id, user_id, content, is_deleted, deleted_at, deleted_by, created_at, updated_at`,
        [post_id, user_id, content.trim()]
      );

      return result.rows[0] as IComment;
    } catch (error: any) {
      throw error;
    }
  }

  // Get comments for a post
  static async findByPostId(
    post_id: string,
    limit = 20,
    offset = 0,
    includeDeleted = false
  ): Promise<IComment[]> {
    try {
      let whereClause = includeDeleted
        ? "WHERE c.post_id = $1"
        : "WHERE c.post_id = $1 AND c.is_deleted = false";

      const result = await query(
        `SELECT 
          c.id,
          c.post_id,
          c.user_id,
          c.content,
          c.is_deleted,
          c.deleted_at,
          c.deleted_by,
          c.created_at,
          c.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials
         FROM comments c
         JOIN users u ON c.user_id = u.id
         ${whereClause}
         ORDER BY c.created_at ASC
         LIMIT $2 OFFSET $3`,
        [post_id, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get comment by ID
  static async findById(
    id: string,
    includeDeleted = false
  ): Promise<IComment | null> {
    try {
      let whereClause = includeDeleted
        ? "WHERE c.id = $1"
        : "WHERE c.id = $1 AND c.is_deleted = false";

      const result = await query(
        `SELECT 
          c.id,
          c.post_id,
          c.user_id,
          c.content,
          c.is_deleted,
          c.deleted_at,
          c.deleted_by,
          c.created_at,
          c.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials
         FROM comments c
         JOIN users u ON c.user_id = u.id
         ${whereClause}`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get comments by user ID
  static async findByUserId(
    user_id: string,
    limit = 20,
    offset = 0
  ): Promise<IComment[]> {
    try {
      const result = await query(
        `SELECT 
          c.id,
          c.post_id,
          c.user_id,
          c.content,
          c.is_deleted,
          c.deleted_at,
          c.deleted_by,
          c.created_at,
          c.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.user_id = $1 AND c.is_deleted = false
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update comment
  static async updateById(
    id: string,
    user_id: string,
    updateData: UpdateCommentData,
    edited_by?: string
  ): Promise<IComment | null> {
    const { content } = updateData;

    // Validate content
    this.validateContent(content);

    try {
      const result = await query(
        `UPDATE comments 
         SET content = $1, edited_by = $4
         WHERE id = $2 AND (user_id = $3 OR EXISTS(SELECT 1 FROM users WHERE id = $3 AND role = 'admin')) AND is_deleted = false
         RETURNING id, post_id, user_id, content, is_deleted, deleted_at, deleted_by, edited_by, created_at, updated_at`,
        [content.trim(), id, user_id, edited_by || user_id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete comment
  static async softDeleteById(
    id: string,
    user_id: string,
    deleted_by?: string
  ): Promise<boolean> {
    try {
      let whereClause = "WHERE id = $1 AND is_deleted = false";
      let params = [id];

      // If not admin (no deleted_by), only allow user to delete their own comments
      if (!deleted_by) {
        whereClause += " AND user_id = $2";
        params.push(user_id);
      }

      const result = await query(
        `UPDATE comments 
         SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = $${
           params.length + 1
         }
         ${whereClause}`,
        [...params, deleted_by || user_id]
      );

      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if user can modify comment (owner or admin)
  static async canUserModifyComment(
    comment_id: string,
    user_id: string,
    user_role: string
  ): Promise<boolean> {
    try {
      if (user_role === "admin") {
        return true;
      }

      const result = await query("SELECT user_id FROM comments WHERE id = $1", [
        comment_id,
      ]);

      if (!result.rows[0]) {
        return false;
      }

      return result.rows[0].user_id === user_id;
    } catch (error) {
      return false;
    }
  }

  // Get comment count for a post
  static async getCommentCount(post_id: string): Promise<number> {
    try {
      const result = await query(
        "SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND is_deleted = false",
        [post_id]
      );

      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      return 0;
    }
  }
}

export default CommentModel;
