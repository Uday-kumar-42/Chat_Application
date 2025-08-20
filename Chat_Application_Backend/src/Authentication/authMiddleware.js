const jwt = require("jsonwebtoken");
const {User} = require("../Database/userSchema");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.log("no token")
    return res.status(400).json({ msg: "No token provided" });
  }

  try { 
    console.log("token received : " + token);
    const decodedMsg = jwt.verify(token, process.env.JwtSecret);
    const username = decodedMsg.username; // Already correctly uses username
    const currUser = await User.findOne({ username }); 
    req.user = currUser;
    console.log("decoded user : " + currUser);
    next();
  } catch (error) {
    return res.status(400).json({ msg: "Invalid token" });
  }
}

module.exports = authMiddleware;
