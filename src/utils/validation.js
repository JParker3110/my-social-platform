// utils/validation.js
const validateContent = (content) => {
  if (!content || content.trim() === '') {
    throw new Error('Content must be a non-empty string');
  }
};

module.exports = { validateContent };
