const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");

router.get("/my-profile", verifyToken, async (req, res) => {
  try {
    const doc = await db.collection("profiles").doc(req.user.uid).get();
    res.status(200).json({ success: true, profile: doc.exists ? doc.data() : {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/save", verifyToken, async (req, res) => {
  const { 
    firstName, 
    lastName, 
    dateOfBirth, 
    professionalTitle, 
    bio, 
    portfolioUrl, 
    githubUrl, 
    skills,
    education,
    previousJobs 
  } = req.body;
  
  try {
    await db.collection("profiles").doc(req.user.uid).set({
      firstName: firstName || "",
      lastName: lastName || "",
      dateOfBirth: dateOfBirth || "",
      professionalTitle: professionalTitle || "",
      bio: bio || "",
      portfolioUrl: portfolioUrl || "",
      githubUrl: githubUrl || "",
      skills: skills || [],
      education: education || "",
      previousJobs: previousJobs || "",
      updatedAt: new Date().toISOString()
    }, { merge: true });
    res.status(200).json({ success: true, message: "Profile update captured." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;