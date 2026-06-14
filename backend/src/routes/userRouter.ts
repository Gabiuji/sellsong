import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  toggleFollowUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

router.get("/search", authMiddleware, searchUsers);
router.post("/:id/follow", authMiddleware, toggleFollowUser);

export default router;
