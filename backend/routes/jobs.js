const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase"); // Import your Firestore instance
const verifyToken = require("../middleware/auth");


// GET: Search across jobs via case-insensitive matching logic queries
router.get("/search", verifyToken, async (req, res) => {
  const queryParam = req.query.q ? req.query.q.toLowerCase() : "";
  try {
    const snapshot = await db.collection("jobs").orderBy("createdAt", "desc").limit(100).get();
    const jobs = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const titleMatch = data.title?.toLowerCase().includes(queryParam);
      const companyMatch = data.company?.toLowerCase().includes(queryParam);
      const descMatch = data.description?.toLowerCase().includes(queryParam);
      
      if (titleMatch || companyMatch || descMatch) {
        jobs.push({ id: doc.id, ...data });
      }
    });
    
    res.status(200).json({ success: true, jobs: jobs.slice(0, 10) }); // Limit return stack arrays
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create a brand new job listing entry inside Firestore
router.post("/create", verifyToken, async (req, res) => {
  const { title, company, location, type, experienceLevel, salaryRange, description, requirements } = req.body;

  if (!title || !company || !location || !description) {
    return res.status(400).json({ success: false, error: "Please populate all mandatory job properties." });
  }

  try {
    const jobData = {
      title,
      company,
      location,
      type,
      experienceLevel,
      salaryRange: salaryRange || "Undisclosed",
      description,
      requirements: requirements || "",
      recruiterUid: req.user.uid, // Collected securely from your verifyToken validation middleware
      createdAt: new Date().toISOString(),
      applicantCount: 0
    };

    const docRef = await db.collection("jobs").add(jobData);
    
    res.status(201).json({ 
      success: true, 
      message: "Job posting stored successfully.", 
      jobId: docRef.id 
    });
  } catch (error) {
    console.error("Firestore database write error:", error);
    res.status(500).json({ success: false, error: "Database rejected the new job listing record." });
  }
});

// 1. GET ALL JOBS FROM FIRESTORE (Public)
router.get("/all", async (req, res) => {
  try {
    const jobsSnapshot = await db.collection("jobs").get();
    const jobsList = [];
    
    jobsSnapshot.forEach(doc => {
      jobsList.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, jobs: jobsList });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve jobs" });
  }
});

// 2. PROTECTED ROUTE: Apply for a Job (Saves transaction to Firestore)
router.post("/apply/:id", verifyToken, async (req, res) => {
  const jobId = req.params.id;
  const userUid = req.user.uid;     // From verified token
  const userEmail = req.user.email; // From verified token

  try {
    // Construct the application object
    const newApplication = {
      jobId: jobId,
      applicantUid: userUid,
      applicantEmail: userEmail,
      appliedAt: new Date().toISOString(),
      status: "Applied"
    };
    // 3. SECURE USER ENDPOINT: Retrieve all applications made by the current user
router.get("/my-applications", verifyToken, async (req, res) => {
  const userUid = req.user.uid;

  try {
    const appsSnapshot = await db.collection("applications")
      .where("applicantUid", "==", userUid)
      .get();

    const appList = [];
    appsSnapshot.forEach(doc => {
      appList.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, applications: appList });
  } catch (error) {
    console.error("Error retrieving individual user application listings:", error);
    res.status(500).json({ success: false, error: "Failed to extract transaction history logs" });
  }
});

    // Save to an 'applications' collection in Firestore
    const docRef = await db.collection("applications").add(newApplication);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      applicationId: docRef.id
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ success: false, error: "Failed to submit application" });
  }
});

module.exports = router;