const API_URL = 'http://your-backend-url.com/api'; // Replace with your actual API URL

export async function convertFiles(files, apiKey) {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  formData.append('apiKey', apiKey);

  try {
    const response = await fetch(`${API_URL}/convert`, {
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