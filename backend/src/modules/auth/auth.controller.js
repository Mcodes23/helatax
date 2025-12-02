import * as authService from "./auth.service.js";
import logger from "../../utils/logger.js";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    logger.info(`New User Registered: ${user.email} as ${user.tax_mode}`);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Register Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    logger.info(`User Logged In: ${user.email}`);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.warn(`Login Failed: ${error.message}`);
    res.status(401).json({ success: false, message: error.message });
  }
};

// @desc    Update User Tax Mode (Triage Fix)
// @route   PUT /api/v1/auth/update-mode
export const updateTaxMode = async (req, res) => {
  try {
    const { tax_mode } = req.body;
    const user = req.user; // Comes from 'protect' middleware

    // 1. Validate Input
    if (!["TRADER", "PROFESSIONAL"].includes(tax_mode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Tax Mode" });
    }

    // 2. Update & Save
    user.tax_mode = tax_mode;
    await user.save();

    logger.info(`User ${user.email} manually switched to ${tax_mode}`);

    // 3. Return Updated User (So frontend can update context)
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        tax_mode: user.tax_mode,
        // We don't need to issue a new token, just confirm the change
      },
    });
  } catch (error) {
    logger.error(`Update Mode Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
