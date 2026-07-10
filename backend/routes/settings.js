const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");

// 1. GET SETTINGS: Extract primary document user configurations
router.get("/my-settings", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User profile record not found." });
    }
    res.status(200).json({ success: true, user: userDoc.data() });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load individual user configurations." });
  }
});

// 2. UPDATE PROFILE: Using .set with { merge: true } to prevent crashes if doc is missing
router.post("/update-profile", verifyToken, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  try {
    const updatePayload = {
      updatedAt: new Date().toISOString()
    };

    if (firstName !== undefined) updatePayload.firstName = firstName;
    if (lastName !== undefined) updatePayload.lastName = lastName;
    if (phone !== undefined) updatePayload.phone = phone;

    // CHANGED: .set(..., { merge: true }) creates the document automatically if missing!
    await db.collection("users").doc(req.user.uid).set(updatePayload, { merge: true });
    
    res.status(200).json({ success: true, message: "Profile elements updated successfully." });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, error: "Database transaction runtime dropped structural edits." });
  }
});

// 3. UPDATE PREFERENCES: Using .set with { merge: true } here as well for safety
router.post("/update-preferences", verifyToken, async (req, res) => {
  const { preferences } = req.body;
  try {
    // CHANGED: .set(..., { merge: true }) for seamless fallback document creation
    await db.collection("users").doc(req.user.uid).set({
      preferences,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ success: true, message: "Preferences object stored." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to persist preference collection values." });
  }
});

// 4. PURGE ACCOUNT: Wipe database files when a client initiates destruction
router.delete("/purge-account", verifyToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const batch = db.batch();

    // Reference primary user document and associated items
    const userRef = db.collection("users").doc(uid);
    const resumeRef = db.collection("resumes").doc(uid);

    batch.delete(userRef);
    batch.delete(resumeRef);

    // Remove any user applications from the collection
    const appsSnapshot = await db.collection("applications").where("applicantUid", "==", uid).get();
    appsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    res.status(200).json({ success: true, message: "Account artifacts dropped completely." });
  } catch (error) {
    console.error("Deletion lifecycle aborted:", error);
    res.status(500).json({ success: false, error: "Failed to safely clear user history from Firestore records." });
  }
});

module.exports = router;