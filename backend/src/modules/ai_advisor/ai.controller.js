import { askAiAdvisor } from "./rag.service.js";

// @desc    Ask a Tax Question
// @route   POST /api/v1/ai/chat
export const chatWithAi = async (req, res) => {
  try {
    const { sanitizedQuestion } = req.body; // Comes from Sanitizer Middleware

    // Get context from the logged-in user
    const userContext = {
      profession: req.user.profession,
      tax_mode: req.user.tax_mode,
    };

    const answer = await askAiAdvisor(sanitizedQuestion, userContext);

    res.json({
      success: true,
      data: {
        question: sanitizedQuestion,
        answer: answer,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
