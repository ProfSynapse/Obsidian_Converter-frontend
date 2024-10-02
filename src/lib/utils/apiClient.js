// src/lib/utils/apiClient.js
// Utility for making API calls to the backend

const API_BASE_URL = '/api'; // Adjust this if your API is hosted elsewhere

export async function convertFiles(files, apiKey) {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  formData.append('apiKey', apiKey);

  try {
    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Conversion failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}