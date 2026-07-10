const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini SDK with key from your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/ai/interview-prep
 * @desc    Generates targeted role-specific interview tips using Gemini API
 * @access  Protected
 */
router.post("/interview-prep", verifyToken, async (req, res) => {
  const { jobTitle, company } = req.body;

  if (!jobTitle || !company) {
    return res.status(400).json({ success: false, error: "Missing required role details context." });
  }

  try {
    // Target the lightweight and lightning fast 1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      You are an elite technical interviewer and career coach. 
      Provide concise, highly actionable interview preparation advice for a candidate interviewing for the position of "${jobTitle}" at "${company}".
      
      Structure your response exactly like this with short bullet points:
      - 2 Key Technical Concepts or skills to review specifically relevant to this role.
      - 1 Behavioral focus area matching standard corporate evaluation frameworks.
      - 1 Predictive high-yield sample interview question they should practice answering.
      
      Keep the formatting clean, professional, and straight to the point without introductory pleasantries.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      tips: responseText
    });
  } catch (error) {
    console.error("Gemini API Engine failure:", error);
    res.status(500).json({ success: false, error: "Failed to communicate with AI generation backend." });
  }
});

module.exports = router;