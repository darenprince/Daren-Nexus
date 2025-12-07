# The Daren Nexus - Architecture

## 1. Project Overview

The Daren Nexus is an advanced, AI-powered chat application designed to be a digital extension of Daren Prince. It provides users with an unfiltered, direct, and persona-driven conversational experience. The application supports multiple interaction modes, rich media, and voice communication, and is built to be a highly dynamic and immersive platform.

## 2. Architecture & Tech Stack

The application is a client-side single-page application (SPA).

*   **Frontend**:
    *   **Framework**: React
    *   **Language**: TypeScript
    *   **Styling**: Tailwind CSS with a dynamic, CSS variable-driven theming system.
    *   **Speech-to-Text (STT)**: The browser's native **Web Speech API** for transcribing user voice input.

*   **AI/ML Integration (Client-Side)**:
    *   **SDK**: `@google/genai` (Google AI SDK for Web)
    *   **Core Conversational Logic**: `gemini-2.5-flash` and `gemini-2.5-pro` for chat responses.
    *   **Text-to-Speech (TTS)**: `gemini-2.5-flash-preview-tts` for generating voice.
    *   **Real-time Voice Conversations**: `gemini-2.5-flash-native-audio-preview-09-2025` for the Live Voice Mode feature.

*   **Client-Side Storage**: `localStorage` and `sessionStorage` are used via `persistenceService` to store user data, chat sessions, settings, and one-time event flags.

## 3. Core Systems

### 3.1. Client-Side Architecture

The React application is responsible for all UI rendering, user interaction, and business logic. It makes direct calls to the Google Gemini API using the `@google/genai` SDK.

### 3.2. API Key Management

The application requires a valid Google Gemini API key to function. The key must be provided as an environment variable named `API_KEY` in the hosting environment. The application code references `process.env.API_KEY` to initialize the AI SDK.

### 3.3. Conversational AI Core & Dynamic Persona

The AI's persona is constructed on the client-side for every message sent.

1.  **Foundation**: It starts with the `initialSystemInstruction` from `services/persona.ts`.
2.  **Mode Layering**: It appends a `modeDirective` based on the user's selected mode.
3.  **Final Prompt**: This layered text becomes the `systemInstruction` for the Gemini API call, resulting in a highly contextual and dynamic persona.

## 4. Running the Application Locally

The application is a static web app.

1.  Ensure you have a mechanism to provide the `API_KEY` environment variable.
2.  Serve the project's root directory using any simple HTTP server. If you have Python 3, this is an easy way:
    ```bash
    python3 -m http.server 3000
    ```
3.  Open your browser to `http://localhost:3000`.

## 5. Special Features

*   **Nexus & Chill / Nexus Who**: These features are self-contained within the frontend and do not require special backend interaction.
