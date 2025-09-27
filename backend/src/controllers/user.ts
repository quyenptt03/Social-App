import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import CustomError from "../errors";
import UserService from "../services/user.service";

// Extended Request interface to include user data
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "user" | "admin";
  };
}

const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    const user = await UserService.getCurrentUser(req.user.userId);

    res.status(StatusCodes.OK).json({
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    if (error instanceof CustomError.NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to get user profile",
      });
    }
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    const { display_name, full_name, email } = req.body;

    // Validate that at least one field is provided
    if (!display_name && !full_name && !email) {
      throw new CustomError.BadRequestError(
        "Please provide at least one field to update"
      );
    }

    const updatedUser = await UserService.updateProfile(req.user.userId, {
      display_name,
      full_name,
      email,
    });

    res.status(StatusCodes.OK).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to update profile",
      });
    }
  }
};

/**
 * Change user password
 */
const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new CustomError.BadRequestError(
        "Please provide current password and new password"
      );
    }

    const result = await UserService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to change password",
      });
    }
  }
};

/**
 * Deactivate user account
 */
const deactivateAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    const result = await UserService.deactivateAccount(req.user.userId);

    // Clear the cookie after deactivation
    res.clearCookie("token");

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    if (error instanceof CustomError.NotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to deactivate account",
      });
    }
  }
};

/**
 * Search users (authenticated users only)
 */
const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    const { q: searchTerm, limit = 12, offset = 0 } = req.query;

    if (!searchTerm || typeof searchTerm !== "string") {
      throw new CustomError.BadRequestError("Please provide a search term");
    }

    const users = await UserService.searchUsers(
      searchTerm,
      parseInt(limit as string) || 12,
      parseInt(offset as string) || 0
    );

    res.status(StatusCodes.OK).json({
      message: "Users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Search failed",
      });
    }
  }
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      throw new CustomError.UnauthorizedError(
        "Access denied. Admin privileges required."
      );
    }

    const { limit = 50, offset = 0 } = req.query;

    const users = await UserService.getAllUsers(
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );

    res.status(StatusCodes.OK).json({
      message: "All users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    if (error instanceof CustomError.UnauthorizedError) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to retrieve users",
      });
    }
  }
};

export {
  getCurrentUser,
  updateProfile,
  changePassword,
  deactivateAccount,
  searchUsers,
  getAllUsers,
};
