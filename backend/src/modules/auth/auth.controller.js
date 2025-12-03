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
// backend/src/modules/auth/auth.controller.js

// ...

export const updateTaxMode = async (req, res) => {
  try {
    const { tax_mode } = req.body;
    const user = req.user;

    if (!["TRADER", "PROFESSIONAL"].includes(tax_mode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Tax Mode" });
    }

    // 1. Update Mode
    user.tax_mode = tax_mode;

    // 2. Mark as Confirmed (This prevents showing Triage again)
    user.has_confirmed_details = true;

    await user.save();

    logger.info(`User ${user.email} confirmed role as ${tax_mode}`);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        tax_mode: user.tax_mode,
        has_confirmed_details: user.has_confirmed_details, // Send this back
      },
    });
  } catch (error) {
    logger.error(`Update Mode Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
