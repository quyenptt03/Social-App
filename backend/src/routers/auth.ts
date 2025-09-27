import express from "express";
import { register, login, logout } from "../controllers/auth";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", authenticateUser, logout);

export default router;
