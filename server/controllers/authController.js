import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Generate JWT token
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECERT;
    if (!jwtSecret) throw new Error("JWT_SECRET is not configured");
    return jwt.sign({ id }, jwtSecret, { expiresIn: "30d" })
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ success: false, message: "User already exist" });

        // Encrypt Password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))

        // Create User
        const user = await User.create({ name, email, password: hashedPassword })

        const token = generateToken(user._id)

        return res.status(201).json({ success: true, token, user })
    } catch (e) {
        console.log("Register error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}


// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ success: false, message: "User does not exist" });

        // check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }

        const token = generateToken(user._id)

        return res.status(201).json({ success: true, token, user })
    } catch (e) {
        console.log("Login error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//Get Current User
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not Found" })
        }
        res.json({ success: true, user })
    } catch (e) {
        console.log("Get user error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}