import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import './ObsidianNoteConverter.css';

const ObsidianNoteConverter = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [convertedContent, setConvertedContent] = useState('');

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const result = await response.json();
      setConvertedContent(result.convertedContent);
      setProcessingStatus('completed');
    } catch (error) {
      console.error('Error during conversion:', error);
      setProcessingStatus('error');
    }
  };

  return (
    <div className="obsidian-note-converter">
      <h1>Obsidian Note Converter</h1>
      <p className="subtitle">A product of Synaptic Labs</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="api-key">OpenAI API Key:</label>
          <Input
            type="password"
            id="api-key"
            value={apiKey}
            onChange={handleApiKeyChange}
            required
            placeholder="Enter your OpenAI API Key"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="file-upload">Select File:</label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!apiKey || !file || processingStatus === 'processing'}
        >
          Convert Note
        </Button>
      </form>

      {processingStatus === 'processing' && (
        <p className="status processing">Processing your file...</p>
      )}

      {processingStatus === 'completed' && (
        <div className="result">
          <p className="status completed">Conversion completed!</p>
          <h2>Converted Content:</h2>
          <pre>{convertedContent}</pre>
          <Button onClick={() => {
            const blob = new Blob([convertedContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_note.md';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Download Converted Note
          </Button>
        </div>
      )}

      {processingStatus === 'error' && (
        <p className="status error">An error occurred during conversion. Please try again.</p>
      )}
    </div>
  );
};

export default ObsidianNoteConverter;