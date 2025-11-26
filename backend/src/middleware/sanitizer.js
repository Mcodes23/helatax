// Regex for KRA PIN: One letter + 9 digits + One letter (e.g., A001234567Z)
const PIN_REGEX = /[A-Z]\d{9}[A-Z]/gi;

// Regex for Phone Numbers (Kenya): 07xx or +254xx
const PHONE_REGEX = /(\+254|0)(7|1)\d{8}/g;

export const sanitizeInput = (req, res, next) => {
  if (req.body && req.body.question) {
    let cleanText = req.body.question;

    // Redact PINs
    cleanText = cleanText.replace(PIN_REGEX, "[REDACTED_PIN]");

    // Redact Phones
    cleanText = cleanText.replace(PHONE_REGEX, "[REDACTED_PHONE]");

    // Update the body with clean text
    req.body.sanitizedQuestion = cleanText;
  }
  next();
};
