const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

// GET: Fetch ALL global applications with robust legacy field normalization
router.get("/all", async (req, res) => {
  try {
    const appsSnapshot = await db.collection("applications").get();
    const allApplications = [];

    appsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // 1. Defend against jobId being a DocumentReference or alternative casing
      let jobIdRaw = data.jobId || data.job_id || data.jobID;
      if (jobIdRaw && typeof jobIdRaw === 'object' && jobIdRaw.id) {
        jobIdRaw = jobIdRaw.id; 
      }

      // 2. Map fields utilizing fallback options to capture old test documents
      allApplications.push({
        id: doc.id,
        jobId: jobIdRaw || "legacy_unassigned",
        applicantUid: data.applicantUid || data.uid || "UnknownUID",
        applicantEmail: data.applicantEmail || data.email || "No Email Provided",
        applicantName: data.applicantName || data.name || "Legacy Candidate", 
        appliedAt: data.appliedAt || (doc.createTime ? doc.createTime.toDate().toISOString() : new Date().toISOString()),
        status: data.status || data.trackingStatus || "Applied",
        resumeUrl: data.resumeUrl || data.resume || null,
        // Capture explicit title text if it was embedded directly in the app document
        jobTitle: data.jobTitle || data.job_title || null,
        company: data.company || data.companyName || null
      });
    });

    res.status(200).json({ success: true, applications: allApplications });
  } catch (error) {
    console.error("Global Applicants Retrieval Error:", error);
    res.status(500).json({ success: false, error: "Failed to extract database application history log." });
  }
});

module.exports = router;