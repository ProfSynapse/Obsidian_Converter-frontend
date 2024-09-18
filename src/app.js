import React from 'react';
import ObsidianNoteConverter from './components/ObsidianNoteConverter/ObsidianNoteConverter';
import './styles/index.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Obsidian Note Converter</h1>
        <p>A product of Synaptic Labs</p>
      </header>
      <main>
        <ObsidianNoteConverter />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Synaptic Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;