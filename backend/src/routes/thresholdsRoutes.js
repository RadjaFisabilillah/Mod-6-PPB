import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";
import { protectRoute } from "../utils/auth.js"; // Import middleware

const router = express.Router();

router.get("/", ThresholdsController.list);
router.post("/", protectRoute, ThresholdsController.create); // Protected
router.get("/latest", ThresholdsController.latest);

// --- FITUR BARU: HAPUS DATA ---
router.delete("/clear", protectRoute, ThresholdsController.clear); // Protected
router.delete("/:id", protectRoute, ThresholdsController.remove); // Protected

export default router;
