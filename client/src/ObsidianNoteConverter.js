import React, { useState } from 'react';
import axios from 'axios';
import './ObsidianNoteConverter.css';

const ObsidianNoteConverter = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [convertedText, setConvertedText] = useState('');

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessingStatus('processing');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apiKey', apiKey);

    try {
      const response = await axios.post('/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setConvertedText(response.data.markdown);
      setProcessingStatus('completed');
    } catch (error) {
      console.error('Error converting file:', error);
      setProcessingStatus('error');
    }
  };

  return (
    <div className="obsidian-note-converter">
      <h1>Obsidian Note Converter</h1>
      <form onSubmit={handleSubmit}>
        {/* ... (rest of your form code) ... */}
      </form>
      {processingStatus === 'processing' && <p>Processing your file...</p>}
      {processingStatus === 'completed' && (
        <div>
          <p>Conversion completed!</p>
          <pre>{convertedText}</pre>
        </div>
      )}
      {processingStatus === 'error' && <p>An error occurred during conversion.</p>}
    </div>
  );
};

export default ObsidianNoteConverter;