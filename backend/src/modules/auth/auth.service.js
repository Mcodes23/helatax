import User from "../../models/User.js"; // Import the User Model we made earlier
import jwt from "jsonwebtoken";

// 1. The Triage Gatekeeper Logic
// Returns 'PROFESSIONAL' or 'TRADER' based on input
const determineTaxMode = (profession, businessType) => {
  // List of professions excluded from Turnover Tax (Section 12C)
  const forbiddenProfessions = [
    "Doctor",
    "Engineer",
    "Accountant",
    "Lawyer",
    "Consultant",
    "IT Specialist",
    "Architect",
    "Auditor",
  ];

  // Logic: If profession is forbidden, FORCE Professional Mode
  if (
    forbiddenProfessions.some((p) => profession.includes(p)) ||
    businessType === "CONSULTANT"
  ) {
    return "PROFESSIONAL";
  }

  // Default to Trader (3% Tax)
  return "TRADER";
};

// 2. Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 3. Register User Service
export const registerUser = async (userData) => {
  const { name, email, password, kra_pin, profession, businessType } = userData;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  // Run the Gatekeeper
  const taxMode = determineTaxMode(profession, businessType);

  // Create User
  // Note: has_confirmed_details defaults to false in the Schema, but we can be explicit here
  const user = await User.create({
    name,
    email,
    password,
    kra_pin,
    profession,
    tax_mode: taxMode, // <--- System sets this, not the user!
    has_confirmed_details: false, // <--- User must confirm this on Triage page
    obligations: {
      is_vat_registered: false,
      has_mortgage: false,
    },
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    tax_mode: user.tax_mode,
    has_confirmed_details: user.has_confirmed_details, // <--- SEND FLAG TO FRONTEND
    token: generateToken(user._id),
  };
};

// 4. Login User Service
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      tax_mode: user.tax_mode,
      has_confirmed_details: user.has_confirmed_details, // <--- SEND FLAG TO FRONTEND
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};
