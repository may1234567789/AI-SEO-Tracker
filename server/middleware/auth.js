import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ success: false, message: " Not authorized, no token" })
        }
        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(token, jwtSecret)

        req.userId = decoded.id;
        next()
    } catch (error) {
        console.error("Auth middleware error: ", error.message);
        return res.status(401).json({ success: false, message: " Not authorized, token failed" })
    }
}

export default auth;