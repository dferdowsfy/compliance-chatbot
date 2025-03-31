# Compliance Chatbot for Secure Cloud Setup

A compliance-driven AI chatbot that configures secure cloud infrastructure using Terraform. It supports different cloud environments (AWS, GCP, Azure) and maps decisions to security controls (FedRAMP, NIST, ISO 27001).

## Features

- **Security Framework Selection**: Choose from multiple compliance frameworks
- **AI-Driven Infrastructure Advice**: Powered by Google's Gemini 2.5 Pro
- **Real-Time Control Mapping**: See how your choices map to compliance controls
- **Terraform Code Generation**: Get deployable infrastructure as code
- **Session History**: Review past configurations and compliance scores

## Technology Stack

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **AI**: Google Gemini 2.5 Pro (gemini-2.5-pro-exp-03-25)
- **Infrastructure**: Terraform
- **Storage** (Production): Google Firestore, Google Cloud Storage

## Prerequisites

- Node.js 16+
- npm or yarn
- Google Generative AI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/compliance-chatbot.git
   cd compliance-chatbot
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd ../backend
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following:
   ```
   PORT=5000
   GEMINI_API_KEY=your_api_key_here
   NODE_ENV=development
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Production Deployment

For production deployment:

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Set the environment variables for production:
   ```
   NODE_ENV=production
   PORT=your_production_port
   GEMINI_API_KEY=your_api_key
   ```

3. Start the server which will serve both the API and the static frontend:
   ```
   cd backend
   npm start
   ```

## Google Cloud Setup (Production)

For production use with Google Cloud:

1. Set up a Google Cloud project
2. Enable the Firestore and Cloud Storage APIs
3. Create service account credentials and store them securely
4. Update the backend to use these services for persistent storage

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 