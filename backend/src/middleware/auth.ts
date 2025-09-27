import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import AuthService, { TokenPayload } from "../services/auth.service";
import { isTokenValid } from "../utils/jwt";
import CustomError from "../errors";

// Extended Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "user" | "admin";
  };
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookies
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // Remove 'Bearer ' prefix
    }

    // If no token in header, check signed cookies
    if (!token && req.signedCookies?.token) {
      token = req.signedCookies.token;
    }

    if (!token) {
      throw new CustomError.UnauthenticatedError("Authentication invalid");
    }

    // Verify token and get user (this validates the token and user exists)
    await AuthService.verifyToken(token);

    // Get token payload directly for consistent userId field
    const decoded = isTokenValid(token) as TokenPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication invalid",
    });
  }
};

/**
 * Authorization middleware - Check for specific roles
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = authorizeRoles("admin");

/**
 * Optional authentication middleware
 * Adds user info to request if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // If no token in header, check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const user = await AuthService.verifyToken(token);
        req.user = {
          userId: user.id,
          username: user.username,
          role: user.role,
        };
      } catch (error) {
        // Token invalid, but continue without user
        req.user = undefined;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
