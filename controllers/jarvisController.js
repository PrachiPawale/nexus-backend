const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// Process commands
const processCommand = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Command text is required"
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/process-command`,
      { text },
      { timeout: 60000 }
    );

    res.json(response.data);

  } catch (error) {
    console.error("JARVIS Command Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to process JARVIS command",
      error: error.response?.data || error.message
    });
  }
};


// AI Chat
const chatWithJarvis = async (req, res) => {
  try {
    const { text, session_id = "default" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/chat`,
      { text, session_id },
      { timeout: 60000 }
    );

    res.json(response.data);

  } catch (error) {
    console.error("JARVIS Chat Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to communicate with JARVIS",
      error: error.response?.data || error.message
    });
  }
};


// Get conversation history
const getConversation = async (req, res) => {
  try {
    const { session_id } = req.params;

    const response = await axios.get(
      `${AI_SERVICE_URL}/conversation/${encodeURIComponent(session_id)}`
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve conversation",
      error: error.response?.data || error.message
    });
  }
};


// Clear conversation history
const clearConversation = async (req, res) => {
  try {
    const { session_id } = req.params;

    const response = await axios.delete(
      `${AI_SERVICE_URL}/conversation/${encodeURIComponent(session_id)}`
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to clear conversation",
      error: error.response?.data || error.message
    });
  }
};


module.exports = {
  processCommand,
  chatWithJarvis,
  getConversation,
  clearConversation
};