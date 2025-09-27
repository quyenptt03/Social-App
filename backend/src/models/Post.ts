import { query } from "../db/connect";
import CustomError from "../errors";

export interface IPost {
  id: string;
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
  comment_count?: number;
}

export interface CreatePostData {
  user_id: string;
  content: string;
}

export interface UpdatePostData {
  content: string;
}

class PostModel {
  // Validation methods
  static validateContent(content: string): void {
    if (!content) {
      throw new Error("Post content is required");
    }
    if (content.length > 1000) {
      throw new Error("Post content cannot be more than 1000 characters");
    }
    if (content.trim().length < 1) {
      throw new Error("Post content cannot be empty");
    }
  }

  // Create a new post
  static async create(postData: CreatePostData): Promise<IPost> {
    const { user_id, content } = postData;

    // Validate content
    this.validateContent(content);

    if (!user_id) {
      throw new Error("User ID is required");
    }

    try {
      const result = await query(
        `INSERT INTO posts (user_id, content) 
         VALUES ($1, $2) 
         RETURNING id, user_id, content, is_deleted, deleted_at, deleted_by, edited_by, created_at, updated_at`,
        [user_id, content.trim()]
      );

      return result.rows[0] as IPost;
    } catch (error: any) {
      throw error;
    }
  }

  // Get timeline posts (for home page)
  static async getTimeline(
    limit = 12,
    offset = 0,
    includeDeleted = false
  ): Promise<IPost[]> {
    try {
      let whereClause = includeDeleted ? "" : "WHERE p.is_deleted = false";

      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.edited_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get post by ID
  static async findById(
    id: string,
    includeDeleted = false
  ): Promise<IPost | null> {
    try {
      let whereClause = includeDeleted
        ? "WHERE p.id = $1"
        : "WHERE p.id = $1 AND p.is_deleted = false";

      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.edited_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ${whereClause}`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get posts by user ID
  static async findByUserId(
    user_id: string,
    limit = 12,
    offset = 0
  ): Promise<IPost[]> {
    try {
      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.edited_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1 AND p.is_deleted = false
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update post
  static async updateById(
    id: string,
    user_id: string,
    updateData: UpdatePostData,
    edited_by?: string
  ): Promise<IPost | null> {
    const { content } = updateData;

    // Validate content
    this.validateContent(content);

    try {
      const result = await query(
        `UPDATE posts 
         SET content = $1, edited_by = $4
         WHERE id = $2 AND (user_id = $3 OR EXISTS(SELECT 1 FROM users WHERE id = $3 AND role = 'admin')) AND is_deleted = false
         RETURNING id, user_id, content, is_deleted, deleted_at, deleted_by, edited_by, created_at, updated_at`,
        [content.trim(), id, user_id, edited_by || user_id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete post
  static async softDeleteById(
    id: string,
    user_id: string,
    deleted_by?: string
  ): Promise<boolean> {
    try {
      let whereClause = "WHERE id = $1 AND is_deleted = false";
      let params = [id];

      // If not admin (no deleted_by), only allow user to delete their own posts
      if (!deleted_by) {
        whereClause += " AND user_id = $2";
        params.push(user_id);
      }

      const result = await query(
        `UPDATE posts 
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

  // Search posts by content
  static async search(
    searchTerm: string,
    limit = 12,
    offset = 0
  ): Promise<IPost[]> {
    try {
      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.edited_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.is_deleted = false 
         AND (
           p.content ILIKE '%' || $1 || '%' 
           OR u.username ILIKE '%' || $1 || '%'
           OR u.full_name ILIKE '%' || $1 || '%'
           OR u.display_name ILIKE '%' || $1 || '%'
         )
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if user can modify post (owner or admin)
  static async canUserModifyPost(
    post_id: string,
    user_id: string,
    user_role: string
  ): Promise<boolean> {
    try {
      if (user_role === "admin") {
        return true;
      }

      const result = await query("SELECT user_id FROM posts WHERE id = $1", [
        post_id,
      ]);

      if (!result.rows[0]) {
        return false;
      }

      return result.rows[0].user_id === user_id;
    } catch (error) {
      return false;
    }
  }

  // Get deleted posts (Admin only)
  static async findDeleted(limit = 12, offset = 0): Promise<IPost[]> {
    try {
      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count,
          deleter.username as deleted_by_username
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN users deleter ON p.deleted_by = deleter.id
         WHERE p.is_deleted = true
         ORDER BY p.deleted_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all posts including deleted ones (Admin timeline)
  static async findAll(
    limit = 12,
    offset = 0,
    includeDeleted = true
  ): Promise<IPost[]> {
    try {
      const whereClause = includeDeleted ? "" : "WHERE p.is_deleted = false";

      const result = await query(
        `SELECT 
          p.id,
          p.user_id,
          p.content,
          p.is_deleted,
          p.deleted_at,
          p.deleted_by,
          p.created_at,
          p.updated_at,
          u.username,
          u.full_name,
          COALESCE(u.display_name, u.full_name) as display_name,
          UPPER(LEFT(SPLIT_PART(u.full_name, ' ', 1), 1) || 
                COALESCE(LEFT(SPLIT_PART(u.full_name, ' ', 2), 1), '')) as avatar_initials,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_deleted = false) as comment_count,
          deleter.username as deleted_by_username
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN users deleter ON p.deleted_by = deleter.id
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

export default PostModel;
