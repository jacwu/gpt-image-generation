# Image Creation Application

A full-stack application for generating and editing images using Azure OpenAI's image generation capabilities. This project consists of a Next.js frontend and a Flask backend API.

## Project Architecture

### Overview

This application is built with a modern web architecture:

- **Frontend**: Next.js with TypeScript and TailwindCSS
- **Backend**: Flask API with Python
- **Image Generation**: Azure OpenAI API

### Directory Structure

```
image-create/
├── frontend/               # Next.js frontend application
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx        # Main page component
│   │   ├── layout.tsx      # Root layout component
│   │   └── globals.css     # Global styles
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── backend/                # Flask backend API
│   ├── app.py              # Main Flask application
│   ├── image_generate.py   # Azure OpenAI image generation wrapper
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # Directory for uploaded images
│   ├── generated/          # Directory for generated images
│   └── .env                # Environment variables
```

### Features

- Upload up to 4 images for editing
- Generate new images from text prompts
- Edit existing images with text prompts
- Configure image size and quality
- Download generated images

## Setup and Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm/yarn
- Azure OpenAI API access (for full functionality)

### Backend Setup

1. Create a Python virtual environment:

```bash
cd backend
python -m venv venv
```

2. Activate the virtual environment:

```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your Azure OpenAI API credentials:

```
AZURE_API_KEY=your-api-key
AZURE_ENDPOINT=your-endpoint
AZURE_DEPLOYMENT_NAME=your-deployment-name
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
# or
yarn install
```

## Running the Application

### Start the Backend

```bash
cd backend
# Activate virtual environment first
python app.py
```

The Flask API will run on http://localhost:5000

### Start the Frontend

```bash
cd frontend
npm run dev
# or
yarn dev
```

The Next.js application will run on http://localhost:3000

## API Endpoints

### `/generate-image` (POST)

Generate a new image from a text prompt.

**Parameters:**
- `prompt`: Text description of the image to generate
- `size`: Image size (default: "1024x1024")
- `quality`: Image quality (default: "medium")

### `/edit-image` (POST)

Edit existing images with a text prompt.

**Parameters:**
- `image`: Up to 4 image files to edit
- `prompt`: Text description of the edits to make
- `size`: Image size (default: "1024x1024")
- `quality`: Image quality (default: "medium")

## Development

### Environment Variables

#### Backend (Flask)
- `AZURE_API_KEY`: Your Azure OpenAI API key
- `AZURE_ENDPOINT`: Your Azure OpenAI API endpoint
- `AZURE_DEPLOYMENT_NAME`: Your Azure OpenAI deployment name

#### Frontend (Next.js)
- No specific environment variables required for the frontend

### Project Structure Details

#### Frontend

The frontend is a Next.js application with TypeScript and TailwindCSS. The main page component (`app/page.tsx`) handles:

- Image uploads
- Form submission
- API calls to the backend
- Displaying generated images

#### Backend

The backend is a Flask API that provides endpoints for image generation and editing. It uses:

- `flask-cors` for handling cross-origin requests
- `python-dotenv` for loading environment variables
- `Pillow` for image processing
- `requests` for making API calls to Azure OpenAI

The `AzureImageGenerator` class in `image_generate.py` wraps the Azure OpenAI API for image generation and editing.

## License

This project is licensed under the MIT License.
