import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import CustomError from "../errors";
import { attachCookiesToResponse } from "../utils/jwt";
import AuthService from "../services/auth.service";

// Extended Request interface to include user data
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "user" | "admin";
  };
}

/**
 * Register a new user
 */
const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name, display_name, role } =
      req.body;

    // Validate required fields
    if (!username || !email || !password || !full_name) {
      throw new CustomError.BadRequestError(
        "Please provide username, email, password, and full name"
      );
    }

    // Validate role if provided
    if (role && !["user", "admin"].includes(role)) {
      throw new CustomError.BadRequestError(
        "Role must be either 'user' or 'admin'"
      );
    }

    // Register user through service
    const result = await AuthService.register({
      username,
      email,
      password,
      full_name,
      display_name,
      role: role || "user", // Default to user if not specified
    });

    // Set HTTP-only cookie
    const token = attachCookiesToResponse({ res, user: result.user });

    res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      data: result.user,
      accessToken: result.token,
    });
  } catch (error: any) {
    if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Registration failed. Please try again.",
      });
    }
  }
};

/**
 * Login user
 */
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new CustomError.BadRequestError(
        "Please provide email/username and password"
      );
    }

    // Login user through service
    const result = await AuthService.login({ email, password });

    // Set HTTP-only cookie
    const token = attachCookiesToResponse({ res, user: result.user });

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      data: result.user,
      accessToken: result.token,
    });
  } catch (error: any) {
    if (error instanceof CustomError.UnauthenticatedError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: error.message,
      });
    } else if (error instanceof CustomError.BadRequestError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Login failed. Please try again.",
      });
    }
  }
};

/**
 * Logout user
 */
const logout = async (req: Request, res: Response) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(StatusCodes.OK).json({
      message: "Logout successful",
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Logout failed. Please try again.",
    });
  }
};

/**
 * Get current user profile
 */

export { register, login, logout };
