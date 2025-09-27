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

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new CustomError.BadRequestError(
          "User with this email already exists"
        );
      }

      const existingUserByUsername = await UserModel.findByUsername(
        userData.username
      );
      if (existingUserByUsername) {
        throw new CustomError.BadRequestError(
          "User with this username already exists"
        );
      }

      // Create new user
      const user = await UserModel.create(userData);

      // Generate JWT token
      const tokenPayload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const token = createJWT({ payload: tokenPayload });

      // Return user profile without password
      const userProfile = UserModel.getUserProfile(user);

      return {
        user: userProfile,
        token,
      };
    } catch (error: any) {
      if (error.message.includes("unique")) {
        throw new CustomError.BadRequestError(error.message);
      }
      throw error;
    }
  }

  /**
   * Login user with email/username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new CustomError.BadRequestError(
        "Please provide email/username and password"
      );
    }

    try {
      // Find user by email or username
      const user = await UserModel.findByEmailOrUsername(email);
      if (!user) {
        throw new CustomError.UnauthenticatedError("Invalid credentials");
      }

      // Check if user is active
      if (!user.is_active) {
        throw new CustomError.UnauthenticatedError(
          "Account has been deactivated"
        );
      }

      // Compare password
      const isPasswordValid = await UserModel.comparePasswordForUser(
        user,
        password
      );
      if (!isPasswordValid) {
        throw new CustomError.UnauthenticatedError("Invalid credentials");
      }

      // Generate JWT token
      const tokenPayload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const token = createJWT({ payload: tokenPayload });

      // Return user profile without password
      const userProfile = UserModel.getUserProfile(user);

      return {
        user: userProfile,
        token,
      };
    } catch (error: any) {
      if (
        error instanceof CustomError.UnauthenticatedError ||
        error instanceof CustomError.BadRequestError
      ) {
        throw error;
      }
      throw new CustomError.InternalServerError("Login failed");
    }
  }

  /**
   * Verify JWT token and return user data
   */
  static async verifyToken(token: string): Promise<IUser> {
    try {
      if (!token) {
        throw new CustomError.UnauthenticatedError("No token provided");
      }

      // Verify token
      const decoded = isTokenValid(token) as TokenPayload;

      if (!decoded || !decoded.userId) {
        throw new CustomError.UnauthenticatedError("Invalid token");
      }

      // Find user by ID
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new CustomError.UnauthenticatedError("User not found");
      }

      if (!user.is_active) {
        throw new CustomError.UnauthenticatedError(
          "Account has been deactivated"
        );
      }

      return user;
    } catch (error: any) {
      if (error instanceof CustomError.UnauthenticatedError) {
        throw error;
      }
      throw new CustomError.UnauthenticatedError("Authentication invalid");
    }
  }

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

export default AuthService;
export function login(loginCredentials: { email: string; password: string }) {
  throw new Error("Function not implemented.");
}
