const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const fishingController = require("../controllers/fishingController");

router.get("/", authMiddleware, fishingController.getAll);
router.post("/", authMiddleware, fishingController.create);
router.get("/:id", authMiddleware, fishingController.getOne);
router.put("/:id", authMiddleware, fishingController.update);
router.delete("/:id", authMiddleware, fishingController.remove);

module.exports = router;
