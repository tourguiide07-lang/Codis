# CODIS AI backend

This server connects the CODIS Android/WebView interface to OpenAI. **Never commit an API key.**

## Deploy (Render)
1. Sign in to Render and choose **New → Blueprint**.
2. Connect this GitHub repository and select this repo; Render reads `render.yaml`.
3. During setup, set `OPENAI_API_KEY` to your own OpenAI API key in Render's environment prompt/dashboard (keep it secret).
4. Deploy. Copy the service's HTTPS URL (for example `https://codis-ai-xxxx.onrender.com`).
5. In CODIS → Settings, paste that URL and tap **Save settings**.

## API
- `GET /` and `GET /health`
- `POST /api/chat` JSON: `{"message":"Hello","history":[]}`
- Response: `{"reply":"..."}`

The backend uses `gpt-4o-mini` by default; change `OPENAI_MODEL` in Render if needed. OpenAI API usage is billed separately from ChatGPT subscriptions. Render's free service may sleep when idle and take a little time to wake.
