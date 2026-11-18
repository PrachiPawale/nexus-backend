const express = require("express");
const router = express.Router();

const {
  processCommand,
  chatWithJarvis,
  getConversation,
  clearConversation
} = require("../controllers/jarvisController");

router.post("/process", processCommand);

router.post("/chat", chatWithJarvis);

router.get("/conversation/:session_id", getConversation);

router.delete("/conversation/:session_id", clearConversation);

module.exports = router;