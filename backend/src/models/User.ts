import validator from "validator";
import { genSalt, hash, compare } from "bcrypt";
import { query } from "../db/connect";

export interface IUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  display_name?: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  display_name?: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  display_name?: string;
  full_name?: string;
  email?: string;
}

export class UserModel {
  // Validation methods
  static validateEmail(email: string): void {
    if (!email) {
      throw new Error("Please provide email");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Please provide a valid email address");
    }
  }

  static validatePassword(password: string): void {
    if (!password) {
      throw new Error("Please provide password");
    }
    if (password.length < 6) {
      throw new Error("Password can not be less than 6 characters");
    }
  }

  static validateUsername(username: string): void {
    if (!username) {
      throw new Error("Please provide username");
    }
    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (username.length > 50) {
      throw new Error("Username can not be more than 50 characters");
    }
  }

  static validateFullName(full_name: string): void {
    if (!full_name) {
      throw new Error("Please provide full name");
    }
    if (full_name.length > 100) {
      throw new Error("Full name can not be more than 100 characters");
    }
  }

  // Create a new user
  static async create(userData: CreateUserData): Promise<IUser> {
    const { username, email, password, full_name, display_name, role = 'user' } = userData;

    // Validate all fields
    this.validateEmail(email);
    this.validatePassword(password);
    this.validateUsername(username);
    this.validateFullName(full_name);

    // Hash password
    const salt = await genSalt(10);
    const password_hash = await hash(password, salt);

    try {
      const result = await query(
        `INSERT INTO users (username, email, password_hash, full_name, display_name, role) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, username, email, full_name, display_name, role, is_active, created_at, updated_at`,
        [username.toLowerCase().trim(), email.toLowerCase().trim(), password_hash, full_name.trim(), display_name?.trim(), role]
      );

      return result.rows[0] as IUser;
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Error, expected email to be unique.');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('Error, expected username to be unique.');
        }
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await query(
        'SELECT id, username, email, password_hash, full_name, display_name, role, is_active, created_at, updated_at FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase().trim()]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username: string): Promise<IUser | null> {
    try {
      const result = await query(
        'SELECT id, username, email, password_hash, full_name, display_name, role, is_active, created_at, updated_at FROM users WHERE username = $1 AND is_active = true',
        [username.toLowerCase().trim()]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email or username (for login)
  static async findByEmailOrUsername(identifier: string): Promise<IUser | null> {
    if (!identifier) {
      throw new Error("Please provide email or username");
    }

    try {
      const result = await query(
        'SELECT id, username, email, password_hash, full_name, display_name, role, is_active, created_at, updated_at FROM users WHERE (email = $1 OR username = $1) AND is_active = true',
        [identifier.toLowerCase().trim()]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<IUser | null> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const result = await query(
        'SELECT id, username, email, password_hash, full_name, display_name, role, is_active, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Compare password method
  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    if (!candidatePassword) {
      throw new Error("Please provide password");
    }
    try {
      return await compare(candidatePassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Instance-like method for backward compatibility
  static async comparePasswordForUser(user: IUser, candidatePassword: string): Promise<boolean> {
    return this.comparePassword(candidatePassword, user.password_hash);
  }

  // Update user
  static async updateById(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Validate update data
    if (updateData.email) {
      this.validateEmail(updateData.email);
    }
    if (updateData.full_name) {
      this.validateFullName(updateData.full_name);
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (updateData.display_name !== undefined) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(updateData.display_name?.trim());
    }

    if (updateData.full_name) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(updateData.full_name.trim());
    }

    if (updateData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updateData.email.toLowerCase().trim());
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id); // Add ID as last parameter

    try {
      const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} AND is_active = true 
         RETURNING id, username, email, full_name, display_name, role, is_active, created_at, updated_at`,
        values
      );

      return result.rows[0] || null;
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Error, expected email to be unique.');
        }
      }
      throw error;
    }
  }

  // Update password
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    this.validatePassword(newPassword);

    const salt = await genSalt(10);
    const password_hash = await hash(newPassword, salt);

    try {
      const result = await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = true',
        [password_hash, id]
      );

      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete user
  static async deleteById(id: string): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET is_active = false WHERE id = $1',
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  static async findAll(limit = 50, offset = 0): Promise<IUser[]> {
    try {
      const result = await query(
        'SELECT id, username, email, full_name, display_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async search(searchTerm: string, limit = 20, offset = 0): Promise<IUser[]> {
    try {
      const result = await query(
        `SELECT id, username, email, full_name, display_name, role, is_active, created_at, updated_at 
         FROM users 
         WHERE is_active = true 
         AND (
           username ILIKE '%' || $1 || '%' 
           OR full_name ILIKE '%' || $1 || '%' 
           OR display_name ILIKE '%' || $1 || '%'
         )
         ORDER BY username
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user profile (without sensitive data)
  static getUserProfile(user: IUser) {
    const { password_hash, ...profile } = user;
    return {
      ...profile,
      avatar_initials: this.getAvatarInitials(user)
    };
  }

  // Generate avatar initials
  static getAvatarInitials(user: IUser): string {
    const name = user.display_name || user.full_name;
    const nameParts = name.split(' ');
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + (nameParts[nameParts.length - 1].charAt(0) || '')).toUpperCase();
  }

  // Check if user is admin
  static isAdmin(user: IUser): boolean {
    return user.role === 'admin';
  }
}

export default UserModel;
