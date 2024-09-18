// Ensure you have the API URL in your .env file
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Converts a note using the Obsidian Note Converter API
 * @param {File} file - The file to be converted
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<Object>} The converted note data
 */
export const convertNote = async (file, apiKey) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apiKey', apiKey);

  try {
    const response = await fetch(`${API_URL}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in convertNote:', error);
    throw error;
  }
};

/**
 * Validates the OpenAI API key
 * @param {string} apiKey - The OpenAI API key to validate
 * @returns {Promise<boolean>} Whether the API key is valid
 */
export const validateApiKey = async (apiKey) => {
  try {
    const response = await fetch(`${API_URL}/validate-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error in validateApiKey:', error);
    throw error;
  }
};

/**
 * Fetches the conversion history for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} The user's conversion history
 */
export const getConversionHistory = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/conversion-history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.history;
  } catch (error) {
    console.error('Error in getConversionHistory:', error);
    throw error;
  }
};

/**
 * Sends feedback about a conversion
 * @param {string} conversionId - The ID of the conversion
 * @param {string} feedback - The feedback text
 * @returns {Promise<Object>} The response from the feedback submission
 */
export const sendConversionFeedback = async (conversionId, feedback) => {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversionId, feedback }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in sendConversionFeedback:', error);
    throw error;
  }
};