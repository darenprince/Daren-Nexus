# The Daren Nexus - Production Wiring & Architecture

## 1. Project Overview

The Daren Nexus is an advanced, AI-powered chat application designed to be a digital extension of Daren Prince. It provides users with an unfiltered, direct, and persona-driven conversational experience. The application supports multiple interaction modes, rich media, voice communication, and is built to be a highly dynamic and immersive platform.

This document outlines the full-stack architecture and the wiring required for a fully functional production deployment.

## 2. Architecture & Tech Stack

The application is now a full-stack application with a React frontend and a Node.js backend, designed for security and scalability.

*   **Frontend**:
    *   **Framework**: React
    *   **Language**: TypeScript
    *   **Styling**: Tailwind CSS with a dynamic, CSS variable-driven theming system.
    *   **Speech-to-Text (STT)**: The browser's native **Web Speech API** for transcribing user voice input.

*   **Backend**:
    *   **Runtime**: Node.js
    *   **Framework**: Express.js
    *   **Language**: TypeScript
    *   **Deployment**: Ready for containerized deployment on services like Google Cloud Run.

*   **AI/ML Integration (via Backend)**:
    *   **Core Conversational Logic**: `gemini-2.5-flash` and `gemini-2.5-pro` for chat responses.
    *   **Text-to-Speech (TTS)**: `gemini-2.5-flash-preview-tts` for generating voice.
    *   **Real-time Voice Conversations**: `gemini-2.5-flash-native-audio-preview-09-2025` (**Note**: This is a web-only API and remains a client-side integration. See section 3.4 for details).

*   **Client-Side Storage**: `localStorage` and `sessionStorage` are used via `persistenceService` to store user data, chat sessions, settings, and one-time event flags.

## 3. Core Systems & Full-Stack Wiring

### 3.1. Client-Server Separation

The primary architectural change is the introduction of a backend server to act as a secure intermediary between the frontend client and the Google Gemini API.

*   **Frontend (Client)**: The React application is responsible for all UI rendering and user interaction. It no longer holds the Gemini API key and does not make direct calls to the Gemini HTTP APIs. Instead, it sends requests to its own backend.
*   **Backend (Server)**: The Node.js application, located in the `/server` directory, handles all business logic. It securely stores the `API_KEY` as an environment variable and exposes a REST API for the frontend to consume.

### 3.2. Backend API Endpoints

The server exposes the following endpoints:

*   `POST /api/chat`: Receives chat history, user message, attachments, persona settings, and other flags (like `useWebSearch`). It constructs the full prompt and calls the Gemini `generateContent` API.
*   `POST /api/speech`: Receives text and a voice preference. It calls the Gemini TTS API and returns the base64-encoded audio data.
*   `POST /api/classify`: Receives text and uses a Gemini model to classify the user's intent, returning a classification like 'sexual' or 'neutral'.

### 3.3. Conversational AI Core & Dynamic Persona

The AI's persona is constructed on the backend for every message sent via the `/api/chat` endpoint.

1.  **Foundation**: It starts with the `initialSystemInstruction` from `server/src/persona.ts`.
2.  **Mode Layering**: It appends a `modeDirective` based on the user's selected mode.
3.  **Final Prompt**: This layered text becomes the `systemInstruction` for the Gemini API call, resulting in a highly contextual and dynamic persona.

### 3.4. Voice & Audio Systems

*   **TTS & STT**: These are now handled through the client-server model. The frontend captures audio, but the generation of AI speech is a backend task.
*   **Live Voice Mode (Client-Side Exception)**:
    *   **Critical Limitation**: The Gemini Live API (`ai.live.connect`) is a **web-only feature** that establishes a direct WebSocket connection from the client to Google's servers. The Node.js `@google/genai` SDK does not support this Live API.
    *   **Implementation**: Due to this limitation, the Live Voice Mode remains a client-side feature that initializes the Gemini API directly.
    *   **Production Security**: For a production environment, this is not ideal as it requires an API key on the client. The recommended approach would be to implement a secure token service that generates short-lived, scoped credentials for live sessions, but this is beyond the scope of the current architecture.

## 4. Running the Application Locally (IMPORTANT)

**You must run both the frontend and the backend servers at the same time for the application to be fully functional.** If the backend is not running, the AI will not respond to messages.

### 4.1. Start the Backend Server

1.  Open a new terminal window.
2.  Navigate to the `server` directory: `cd server`
3.  Install dependencies: `npm install`
4.  Create a file named `.env` in the `server` directory and add your API key:
    ```
    API_KEY=your_google_gemini_api_key
    ```
5.  Run the server in development mode (this will watch for changes and restart automatically): `npm run dev`
    The server will start on `http://localhost:8080`. **Leave this terminal running.**

### 4.2. Start the Frontend Server

1.  Open a **second** terminal window in the project's **root** directory.
2.  The frontend is a static application. You can serve it using any simple HTTP server. If you have Python 3, this is an easy way:
    ```bash
    python3 -m http.server 3000
    ```
3.  Open your browser to `http://localhost:3000`. The frontend will automatically make API calls to the backend running on port 8080.

## 5. Deployment

The application is architected to be deployed with a containerized backend and static frontend hosting.

*   **Backend**: The `server` directory can be built into a Docker image and deployed to a service like Google Cloud Run. Remember to set the `API_KEY` as a secret environment variable in your cloud service.
*   **Frontend**: The static frontend files (all files except the `server` directory) can be deployed to any static hosting service like Firebase Hosting or a Cloud Storage bucket.
*   **CORS**: Ensure the `cors` middleware on the server is configured to allow requests from your frontend's production domain if they differ.

## 6. Special Features Wiring

*   **Nexus & Chill / Nexus Who**: These features remain unchanged as they are either self-contained within the frontend (`Nexus & Chill`) or are separate, standalone pages (`Nexus Who`). Their logic does not require backend interaction at this time.
