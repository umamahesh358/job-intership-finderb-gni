# CareerOS AI Backend

This is the AI-powered job search and resume optimization backend built with Express.js, Node.js, and Python (JobSpy).

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- `pip` (for Python dependencies)

## Setup Instructions

1. **Install Node Dependencies:**
   ```bash
   npm install
   ```

2. **Install Python Dependencies (for JobSpy):**
   ```bash
   pip install python-jobspy pandas
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following contents:

   ```env
   # Server Configuration
   PORT=3000
   SESSION_SECRET=your_super_secret_session_key

   # Authentication (Nodemailer)
   # If left blank, it defaults to using an Ethereal test account (prints link in console)
   # SMTP_HOST=smtp.gmail.com
   # SMTP_PORT=587
   # SMTP_USER=your_email@gmail.com
   # SMTP_PASS=your_app_password

   # LLM Configuration (Hybrid Approach)
   # Option A: Local LLM (Ollama or LM Studio)
   # LOCAL_LLM_URL=http://localhost:11434/api/chat
   # LOCAL_LLM_MODEL=gemma:latest

   # Option B: Groq API
   # GROQ_API_KEY=your_groq_api_key_here
   # GROQ_MODEL=llama3-8b-8192

   # Option C: Deterministic Mock Data (Fallback)
   # If neither LOCAL_LLM_URL nor GROQ_API_KEY are provided, the system defaults to returning mock JSON data.
   ```

4. **Run the Server:**
   ```bash
   node src/server.js
   ```
   The server will start on `http://localhost:3000`.

## Testing the Application

You can test the flow without a frontend using the provided test script:
```bash
node test-data/test.js
```
This script will:
1. Mock a user login.
2. Upload a sample PDF resume for parsing.
3. Call the role suggestion endpoint.
4. Trigger the JobSpy scraping engine to fetch real jobs and score them against the resume using the LLM.
