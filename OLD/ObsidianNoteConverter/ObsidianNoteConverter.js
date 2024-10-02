import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../common/button';
import Input from '../common/input';
import logo from '../assets/logo.png';
import axios from 'axios';

const colors = {
  primary: '#00A99D',    // Aqua
  secondary: '#93278F',  // Dark Purple
  tertiary: '#33475B',   // Cello
  accent1: '#F7931E',    // Carrot Orange
  accent2: '#29ABE2',    // Summer Sky
  background: '#FFFFFF', // White
  text: '#33475B',       // Using Cello for text
  error: '#FF0000',      // Red for errors
};

const Container = styled.div`
  font-family: 'Montserrat', sans-serif;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background-color: ${colors.background};
  color: ${colors.text};
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
  }
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
  font-size: 2rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${colors.secondary};
  margin-bottom: 2rem;
  font-size: 1rem;
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
  color: ${props => props.error ? colors.error : colors.accent2};
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
  max-height: 300px;
  overflow-y: auto;
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

const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: ${colors.background};
  border: 1px solid ${colors.primary};
  border-radius: 4px;
`;

const RemoveFileButton = styled.button`
  background-color: ${colors.accent1};
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: ${colors.secondary};
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-top: 1rem;
`;

const ProgressBarFill = styled.div`
  width: ${props => props.progress}%;
  height: 20px;
  background-color: ${colors.primary};
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
`;

const ObsidianNoteConverter = () => {
  const [apiKey, setApiKey] = useState('');
  const [files, setFiles] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [convertedContents, setConvertedContents] = useState([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  const handleApiKeyChange = useCallback((event) => {
    setApiKey(event.target.value);
  }, []);

  const handleFileChange = useCallback((event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setProcessingStatus('processing');
    setConvertedContents([]);
    setConversionProgress(0);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('apiKey', apiKey);

      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/convert`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setConvertedContents(prev => [...prev, { fileName: files[i].name, content: response.data.convertedContent }]);
        setConversionProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Error during conversion:', error);
        setProcessingStatus('error');
        return;
      }
    }

    setProcessingStatus('completed');
  }, [apiKey, files]);

  const handleDownload = useCallback((fileName, content) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const isConvertReady = apiKey && files.length > 0;

  return (
    <Container>
      <LogoContainer>
        <Logo src={logo} alt="Obsidian Note Converter Logo" />
      </LogoContainer>
      <Title>Obsidian Note Converter</Title>
      <Subtitle>Transform your files for Obsidian with ease</Subtitle>
      
      <AccordionContainer>
        <AccordionHeader onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}>
          How to Use
        </AccordionHeader>
        <AccordionContent isOpen={isInstructionsOpen}>
          <ol>
            <li>Enter your OpenAI API key.</li>
            <li>Select one or more files you want to convert.</li>
            <li>Click the "Convert Notes" button.</li>
            <li>Download your converted notes.</li>
          </ol>
        </AccordionContent>
      </AccordionContainer>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="apiKey">OpenAI API Key:</Label>
          <StyledInput
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your OpenAI API key"
          />
          <ApiKeyLink href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">
            Don't have an API key? Get one here.
          </ApiKeyLink>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="fileInput">Select Files:</Label>
          <FileInput
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            multiple
          />
        </FormGroup>

        <FileList>
          {files.map((file, index) => (
            <FileItem key={index}>
              {file.name}
              <RemoveFileButton onClick={() => removeFile(index)}>×</RemoveFileButton>
            </FileItem>
          ))}
        </FileList>

        <StyledButton type="submit" isReady={isConvertReady}>
          Convert Notes
        </StyledButton>
      </form>

      {processingStatus === 'processing' && (
        <>
          <StatusMessage>Processing your files...</StatusMessage>
          <ProgressBarContainer>
            <ProgressBarFill progress={conversionProgress} />
          </ProgressBarContainer>
        </>
      )}

      {processingStatus === 'completed' && (
        <ResultContainer>
          <StatusMessage>Conversion completed!</StatusMessage>
          {convertedContents.map((item, index) => (
            <ConvertedContent key={index}>
              <h3>{item.fileName}</h3>
              <p>{item.content.substring(0, 100)}...</p>
              <StyledButton onClick={() => handleDownload(item.fileName, item.content)} isReady={true}>
                Download Converted Note
              </StyledButton>
            </ConvertedContent>
          ))}
        </ResultContainer>
      )}

      {processingStatus === 'error' && (
        <StatusMessage error>An error occurred during conversion. Please try again.</StatusMessage>
      )}
    </Container>
  );
};

export default ObsidianNoteConverter;