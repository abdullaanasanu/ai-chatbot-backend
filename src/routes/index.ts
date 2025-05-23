import express from "express";

const router = express.Router();

// routes
router.use("/user", require("./user"));
router.use("/chat", require("./chat"));

module.exports = router;
