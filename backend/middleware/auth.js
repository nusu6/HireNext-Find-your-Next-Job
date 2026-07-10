const {admin} = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user payload (uid, email, etc.) to the request object
    req.user = decodedToken;
    next(); 
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({ error: "Forbidden: Token is invalid or expired" });
  }
};

module.exports = verifyToken;