import express from "express";
import {
  changePassword,
  deactivateAccount,
  getAllUsers,
  getCurrentUser,
  searchUsers,
  updateProfile,
} from "../controllers/user";
import { authenticateUser, requireAdmin } from "../middleware/auth";
import {
  validatePasswordChange,
  validateProfileUpdate,
  validateSearch,
} from "../middleware/validation";

const router = express.Router();

router.use(authenticateUser); // All routes below require authentication

router.get("/me", getCurrentUser);
router.patch("/profile", validateProfileUpdate, updateProfile);
router.patch("/change-password", validatePasswordChange, changePassword);
router.delete("/deactivate", deactivateAccount);
router.get("/search", validateSearch, searchUsers);

// Admin only routes
router.get("/", requireAdmin, getAllUsers);

export default router;
