const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/auth");

router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("notifications")
      .where("userId", "==", req.user.uid)
      .where("status", "==", "unread").get();
    res.status(200).json({ success: true, count: snapshot.size });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/list", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("notifications")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc").limit(40).get();
    
    const notifications = [];
    snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/mark-all-read", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("notifications")
      .where("userId", "==", req.user.uid)
      .where("status", "==", "unread").get();
    
    const batch = db.batch();
    snapshot.forEach(doc => batch.update(doc.ref, { status: "read" }));
    await batch.commit();
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;