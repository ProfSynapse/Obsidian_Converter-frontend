# Obsidian Note Converter Frontend

This is the front-end repository for the Obsidian Note Converter, a product of Synaptic Labs.

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/obsidian-note-converter-frontend.git
   cd obsidian-note-converter-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Connecting to the Backend

Currently, the app is set up to log actions to the console. To connect to your backend:

1. Update the `handleSubmit` function in `src/components/ObsidianNoteConverter.js`
2. Replace the console.log statements with actual API calls to your backend server

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).