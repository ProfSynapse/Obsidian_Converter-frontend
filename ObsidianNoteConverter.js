import React, { useState } from 'react';
import './ObsidianNoteConverter.css';

const ObsidianNoteConverter = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessingStatus('processing');

    // TODO: Implement actual API call
    console.log('Processing file:', file.name);
    console.log('Using API Key:', apiKey);

    // Simulating processing time
    setTimeout(() => {
      setProcessingStatus('completed');
    }, 2000);
  };

  return (
    <div className="obsidian-note-converter">
      <h1>Obsidian Note Converter</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="api-key">OpenRouter API Key:</label>
          <input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={handleApiKeyChange}
            required
          />
        </div>
        <div>
          <label htmlFor="file-upload">Select File:</label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={!apiKey || !file || processingStatus === 'processing'}>
          Convert Note
        </button>
      </form>
      {processingStatus === 'processing' && <p>Processing your file...</p>}
      {processingStatus === 'completed' && <p>Conversion completed!</p>}
    </div>
  );
};

export default ObsidianNoteConverter;