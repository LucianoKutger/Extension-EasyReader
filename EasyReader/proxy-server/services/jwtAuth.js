require("dotenv").config();
const jwt = require("jsonwebtoken");

function authenticateProjectJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.PROXY_JWT_SECRET);

    if (decoded.project_id !== process.env.PROJECT_ID) {
      return res.status(403).json({ error: "Invalid projectId" });
    }

    req.project = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authenticateProjectJWT };
