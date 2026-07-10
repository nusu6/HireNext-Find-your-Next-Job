const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");
const { GoogleGenAI } = require("@google/genai");

// Initialize Google Gen AI client interface using your environment key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Reusable wrapper to safely call Gemini with automatic exponential backoff retries 
 * if the remote server reports high traffic bottlenecks (Status 503).
 */
async function generateGeminiContentWithRetry(modelClient, params, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await modelClient.generateContent(params);
    } catch (error) {
      // Catch standard status codes or textual error message strings matching a 503 condition
      const is503 = error.status === 503 || error.message?.includes("503") || error.message?.includes("high demand");
      
      if (is503 && attempt < maxRetries) {
        console.warn(`⚠️ Gemini API busy (503). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        
        // Wait out the delay interval before evaluating the loop again
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Double the sleep penalty duration for successive attempts
        continue;
      }
      
      // Pass the error up if it's a structural syntax issue or we run out of retry attempts
      throw error;
    }
  }
}

// 1. GET ROUTE: Fetch existing data profile safely
router.get("/my-resume", verifyToken, async (req, res) => {
  try {
    const doc = await db.collection("resumes").doc(req.user.uid).get();
    if (!doc.exists) {
      return res.status(200).json({ success: true, resume: null });
    }
    res.status(200).json({ success: true, resume: doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, error: "Database retrieval failure." });
  }
});

// 2. POST ROUTE: Persist resume fields
router.post("/save", verifyToken, async (req, res) => {
  const { personalInfo, experiences, skills } = req.body;
  try {
    await db.collection("resumes").doc(req.user.uid).set({
      uid: req.user.uid,
      personalInfo,
      experiences,
      skills,
      updatedAt: new Date().toISOString()
    });
    res.status(200).json({ success: true, message: "Resume profile synchronized." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Database transaction failure." });
  }
});

// 3. AI ROUTE: Connect prompt context tracking directly to Google Gemini with fault tolerance
router.post("/ai-summarize", verifyToken, async (req, res) => {
  const { skills, experiences } = req.body;

  try {
    const prompt = `Write a professional, impactful 2 short sentence resume profile summary for a worker with the following skills: ${skills}. 
    Their latest experience background includes: ${JSON.stringify(experiences)}. Write it inside first person perspective but avoid cheesy buzzwords.`;

    // Call the retry utility wrapper instead of the raw client method
    const response = await generateGeminiContentWithRetry(ai.models, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 1000,
      }
    });

    const summaryText = response.text.trim();
    res.status(200).json({ success: true, summary: summaryText });
  } catch (error) {
    console.error("Gemini Route Failure Context:", error);
    
    const is503 = error.status === 503 || error.message?.includes("503");
    if (is503) {
      return res.status(503).json({ 
        success: false, 
        error: "Gemini AI engines are heavily congested. Please wait a moment and try again." 
      });
    }

    res.status(500).json({ success: false, error: "Gemini generation sequence failed internally." });
  }
});

module.exports = router;