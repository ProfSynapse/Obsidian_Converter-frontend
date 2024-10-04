// src/lib/utils/api/client.js

import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response;
}

export async function convertFiles(files, apiKey) {
  conversionStatus.startConversion();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    conversionStatus.setCurrentFile(file.name);
    conversionStatus.setProgress(Math.round((i / files.length) * 100));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(ENDPOINTS.CONVERT, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      await handleResponse(response);
      
      // Process the result as needed
      // const result = await response.json();
      // You might want to update a store with the converted content here
    } catch (error) {
      conversionStatus.setError(error.message);
      throw error;
    }
  }

  conversionStatus.completeConversion();
}

export async function downloadZip(fileIds, apiKey) {
  try {
    const response = await fetch(ENDPOINTS.CREATE_ZIP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ fileIds })
    });

    await handleResponse(response);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'obsidian-notes.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading zip file:', error);
    throw error;
  }
}

export async function downloadSingleFile(fileId, apiKey) {
  try {
    const response = await fetch(ENDPOINTS.DOWNLOAD_FILE(fileId), {
      headers: {
        'X-API-Key': apiKey
      }
    });

    await handleResponse(response);

    const blob = await response.blob();
    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'obsidian-note.md';
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}