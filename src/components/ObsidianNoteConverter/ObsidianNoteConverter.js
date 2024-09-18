import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../common/button';
import Input from '../common/input';
import logo from '../assets/logo.png';

const colors = {
  primary: '#00A99D',    // Aqua
  secondary: '#93278F',  // Dark Purple
  tertiary: '#33475B',   // Cello
  accent1: '#F7931E',    // Carrot Orange
  accent2: '#29ABE2',    // Summer Sky
  background: '#FFFFFF', // White
  text: '#33475B',       // Using Cello for text
};

const Container = styled.div`
  font-family: 'Montserrat', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: ${colors.background};
  color: ${colors.text};
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  max-width: 200px;
  height: auto;
`;

const Title = styled.h1`
  color: ${colors.primary};
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${colors.secondary};
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${colors.tertiary};
`;

const StyledInput = styled(Input)`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${colors.primary};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 169, 157, 0.3);
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${colors.primary};
  border-radius: 6px;
  font-size: 1rem;
  background-color: ${colors.background};
`;

const StyledButton = styled(Button)`
  background-color: ${props => props.isReady ? colors.primary : '#cccccc'};
  color: ${colors.background};
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.isReady ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.isReady ? colors.secondary : '#cccccc'};
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
  color: ${props => props.error ? colors.accent1 : colors.accent2};
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
`;

const ConvertedContent = styled.pre`
  background-color: ${colors.tertiary};
  color: ${colors.background};
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ApiKeyLink = styled.a`
  color: ${colors.accent2};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const AccordionContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const AccordionHeader = styled.button`
  background-color: ${colors.primary};
  color: ${colors.background};
  cursor: pointer;
  padding: 1rem;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
  border-radius: 6px;
  font-weight: 600;

  &:hover {
    background-color: ${colors.secondary};
  }
`;

const AccordionContent = styled.div`
  padding: 0 1rem;
  background-color: ${colors.background};
  max-height: ${props => (props.isOpen ? '1000px' : '0')};
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
`;

const ObsidianNoteConverter = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [convertedContent, setConvertedContent] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

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

  const handleDownload = () => {
    const blob = new Blob([convertedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_note.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isConvertReady = apiKey && file;

  return (
    <Container>
      <LogoContainer>
        <Logo src={logo} alt="Synaptic Labs Logo" />
      </LogoContainer>
      <Title>Obsidian Note Converter</Title>
      <Subtitle>Transform your files for Obsidian with ease.</Subtitle>
      
      <AccordionContainer>
        <AccordionHeader onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}>
          Instructions - Click Here
        </AccordionHeader>
        <AccordionContent isOpen={isInstructionsOpen}>
          <p>1. Enter your OpenAI API key.</p>
          <p>2. Select the file(s) you want to convert.</p>
          <p>3. Click the "Convert Note" button.</p>
          <p>4. Download your converted note.</p>
        </AccordionContent>
      </AccordionContainer>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="api-key">OpenAI API Key:</Label>
          <StyledInput
            type="password"
            id="api-key"
            value={apiKey}
            onChange={handleApiKeyChange}
            required
            placeholder="Enter your OpenAI API Key"
          />
          <p>
            Don't have an API key? Get one <ApiKeyLink href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">here</ApiKeyLink>.
          </p>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="file-upload">Select File:</Label>
          <FileInput
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            required
          />
        </FormGroup>
        
        <StyledButton 
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          isReady={isConvertReady}
          disabled={!isConvertReady || processingStatus === 'processing'}
        >
          Convert Note
        </StyledButton>
      </form>

      {processingStatus === 'processing' && (
        <StatusMessage>Processing your file...</StatusMessage>
      )}

      {processingStatus === 'completed' && (
        <ResultContainer>
          <StatusMessage>Conversion completed!</StatusMessage>
          <h2>Converted Content:</h2>
          <ConvertedContent>{convertedContent}</ConvertedContent>
          <StyledButton onClick={handleDownload} isReady={true}>
            Download Converted Note
          </StyledButton>
        </ResultContainer>
      )}

      {processingStatus === 'error' && (
        <StatusMessage error>An error occurred during conversion. Please try again.</StatusMessage>
      )}
    </Container>
  );
};

export default ObsidianNoteConverter;