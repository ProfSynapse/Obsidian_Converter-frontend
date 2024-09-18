import React from 'react';
import styled from 'styled-components';
import ObsidianNoteConverter from './components/ObsidianNoteConverter/ObsidianNoteConverter';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0; // Light gray background, adjust as needed
  padding: 20px;
`;

function App() {
  return (
    <AppContainer>
      <ObsidianNoteConverter />
    </AppContainer>
  );
}

export default App;