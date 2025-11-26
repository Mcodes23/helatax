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
