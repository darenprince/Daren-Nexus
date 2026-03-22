# The Daren Nexus - V3

## 1. Project Overview

The Daren Nexus is an advanced, AI-powered chat application designed to be a digital extension of Daren Prince. The application is a unified client-server application, meaning the backend server also serves the frontend user interface.

## 2. How to Run the App (Simplified)

Follow these steps to get the application running locally.

### Step 1: Install Dependencies

Navigate into the `server/` directory and install all necessary packages.

```bash
cd server
npm install
```

### Step 2: Add Your API Key

1.  While still in the `server/` directory, find the file named `.env.example`.
2.  Make a copy of this file and rename the copy to `.env`.
3.  Open the new `.env` file and replace `YOUR_API_KEY_HERE` with your actual Google AI API key.

    ```
    API_KEY=YOUR_API_KEY_HERE
    ```

### Step 3: Run the Application

Run the development server from the `server/` directory.

```bash
npm run dev
```

This single command will start the server. The application will now be available in your browser at:

**`http://localhost:8080`**
