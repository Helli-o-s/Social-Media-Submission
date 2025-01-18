# Social Media Submission

It is a system that allows users to submit their name, social media handle, and upload multiple images. 
The submitted data will be displayed on an admin dashboard, showing each user's name, 
social media handle, and all images they have uploaded.

## Table of Contents

- Features
- Installation
- Usage
- Configuration
- Development
- Build


## Features

- Deployed on Netlify
- Integration with Supabase
- Built with Vite and TypeScript

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd project
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   
   npm run dev
   
2. Open your browser and navigate to:

   http://localhost:5173
  

## Configuration

- Environment variables are defined in the `.env` file.
- Tailwind CSS is configured in `tailwind.config.js`.
- PostCSS is configured in `postcss.config.js`.
- Vite configuration is in `vite.config.ts`.

### Example `.env` File
```
# Add your environment variables here
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

## Development

- **Linting:**
  ```bash
  npm run lint
  ```
- **Testing:** Add test commands if applicable.

## Build

1. Build the project:
 
   npm run build
  
2. The build output will be in the `dist` directory.


