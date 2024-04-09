const jwt = require("jsonwebtoken")
const JWT_SECRET = require("./config")
const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization'];
    console.log("authorizing")
    console.log(auth)
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(403).json({})
    }
    const token = auth.slice(7, auth.length)
    console.log(token)
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded.data.userId)
        req.userId = decoded.data.userId;
        console.log("user Verified succesfully")
        next();
    }
    catch {
        res.status(403).json({})
    }

}
module.exports = authMiddleware;