obsidian-note-converter/
├── src/
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── useFileUpload.js
│   │   ├── components/
│   │   │   ├── FileUploader.svelte
│   │   │   ├── ConversionStatus.svelte
│   │   │   ├── ResultDisplay.svelte
│   │   │   └── ObsidianNoteConverter.svelte
│   │   ├── stores/
│   │   │   ├── apiKey.js
│   │   │   ├── files.js
│   │   │   └── conversionStatus.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── apiClient.js
│   │   │   ├── fileHandler.js
│   │   │   └── validators.js
│   │   └── api.js
│   ├── routes/
│   │   ├── api/
│   │   │   └── create-zip
│   │   │   |  └── +server.js
│   │   ├── +page.svelte
│   │   └── +layout.svelte
│   └── app.html
│   └── app.css
├── static/
│   └── favicon.png
├── package.json
├── svelte.config.js
└── vite.config.js

# Obsidian Note Converter

Obsidian Note Converter is a web application that allows users to convert various file formats into Obsidian-compatible Markdown notes. This project is built with SvelteKit and integrates with OpenAI's API for advanced text processing.

## Features

- Convert multiple file formats to Obsidian-compatible Markdown
- Drag-and-drop file upload
- Real-time conversion status updates
- Download converted files individually or in batch
- Responsive design for desktop and mobile use

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- An OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/obsidian-note-converter.git
   ```

2. Navigate to the project directory:
   ```
   cd obsidian-note-converter
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

## Development

To start the development server:

```
npm run dev
```

This will start the server at `http://localhost:5173`.

## Building for Production

To create a production build:

```
npm run build
```

To preview the production build:

```
npm run preview
```

## Testing

To run the test suite:

```
npm run test
```

## Usage

1. Open the application in your web browser.
2. Enter your OpenAI API key in the designated field.
3. Upload files by dragging and dropping them into the upload area or by clicking to select files.
4. Click the "Convert Notes" button to start the conversion process.
5. Once conversion is complete, download your converted Obsidian-compatible notes individually or as a batch.

## Contributing

Contributions to the Obsidian Note Converter are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

If you have any questions or feedback, please open an issue on the GitHub repository.

## Acknowledgements

- [SvelteKit](https://kit.svelte.dev/)
- [OpenAI](https://openai.com/)
- [Vite](https://vitejs.dev/)
```