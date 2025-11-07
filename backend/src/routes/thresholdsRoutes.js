import express from "express";
import { ThresholdsController } from "../controllers/thresholdsController.js";

const router = express.Router();

router.get("/", ThresholdsController.list);
router.post("/", ThresholdsController.create);
router.get("/latest", ThresholdsController.latest);

// --- FITUR BARU: HAPUS DATA ---
router.delete("/clear", ThresholdsController.clear);
router.delete("/:id", ThresholdsController.remove);

export default router;
