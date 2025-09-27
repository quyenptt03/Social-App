import UserModel, { IUser, CreateUserData } from "../models/User";
import { createJWT, isTokenValid } from "../utils/jwt";
import CustomError from "../errors";

export interface LoginCredentials {
  email: string; // email or username
  password: string;
}

export interface RegisterData extends CreateUserData {}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    display_name?: string;
    role: "user" | "admin";
    avatar_initials: string;
  };
  token: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: "user" | "admin";
}

class UserService {
  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<any> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError.NotFoundError("User not found");
      }

      return UserModel.getUserProfile(user);
    } catch (error: any) {
      if (error instanceof CustomError.NotFoundError) {
        throw error;
      }
      throw new CustomError.InternalServerError("Failed to get user profile");
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updateData: { display_name?: string; full_name?: string; email?: string }
  ): Promise<any> {
    try {
      const updatedUser = await UserModel.updateById(userId, updateData);
      if (!updatedUser) {
        throw new CustomError.NotFoundError("User not found or update failed");
      }

      return UserModel.getUserProfile(updatedUser);
    } catch (error: any) {
      if (
        error instanceof CustomError.NotFoundError ||
        error instanceof CustomError.BadRequestError
      ) {
        throw error;
      }

      if (error.message.includes("unique")) {
        throw new CustomError.BadRequestError(error.message);
      }

      throw new CustomError.InternalServerError("Failed to update profile");
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      if (!currentPassword || !newPassword) {
        throw new CustomError.BadRequestError(
          "Please provide current and new password"
        );
      }

      // Get user with password hash
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError.NotFoundError("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await UserModel.comparePasswordForUser(
        user,
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new CustomError.BadRequestError("Current password is incorrect");
      }

      // Update password
      await UserModel.updatePassword(userId, newPassword);

      return { message: "Password updated successfully" };
    } catch (error: any) {
      if (
        error instanceof CustomError.BadRequestError ||
        error instanceof CustomError.NotFoundError
      ) {
        throw error;
      }
      throw new CustomError.InternalServerError("Failed to change password");
    }
  }

  /**
   * Deactivate user account (soft delete)
   */
  static async deactivateAccount(userId: string): Promise<{ message: string }> {
    try {
      const success = await UserModel.deleteById(userId);
      if (!success) {
        throw new CustomError.NotFoundError("User not found");
      }

      return { message: "Account deactivated successfully" };
    } catch (error: any) {
      if (error instanceof CustomError.NotFoundError) {
        throw error;
      }
      throw new CustomError.InternalServerError("Failed to deactivate account");
    }
  }

  /**
   * Check if user has admin privileges
   */
  static isAdmin(user: IUser): boolean {
    return UserModel.isAdmin(user);
  }

  /**
   * Admin: Get all users
   */
  static async getAllUsers(limit = 50, offset = 0): Promise<any[]> {
    try {
      const users = await UserModel.findAll(limit, offset);
      return users.map((user) => UserModel.getUserProfile(user));
    } catch (error: any) {
      throw new CustomError.InternalServerError("Failed to get users");
    }
  }

  /**
   * Search users
   */
  static async searchUsers(
    searchTerm: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new CustomError.BadRequestError(
          "Search term must be at least 2 characters"
        );
      }

      const users = await UserModel.search(searchTerm.trim(), limit, offset);
      return users.map((user) => UserModel.getUserProfile(user));
    } catch (error: any) {
      if (error instanceof CustomError.BadRequestError) {
        throw error;
      }
      throw new CustomError.InternalServerError("Search failed");
    }
  }

  /**
   * Validate token format
   */
  static validateTokenFormat(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  /**
   * Extract user ID from token
   */
  static async extractUserIdFromToken(token: string): Promise<string> {
    try {
      const decoded = isTokenValid(token) as TokenPayload;
      if (!decoded || !decoded.userId) {
        throw new CustomError.UnauthenticatedError("Invalid token");
      }
      return decoded.userId;
    } catch (error: any) {
      throw new CustomError.UnauthenticatedError("Invalid token");
    }
  }
}

export default UserService;
