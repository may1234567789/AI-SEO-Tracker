export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name, !email, !password) return res.status(400).json({ success: false, message: "All fields are required" });
    } catch (e) {

    }
}