# CODIS backend deployment

## Render settings

- Runtime: Node
- Branch: `main`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

## Required environment variable

Set `GROQ_API_KEY` in the Render service's Environment tab. Create the key in the
[Groq Console](https://console.groq.com/keys). Do not commit the key, put it in the
Android app, or send it in chat. Keep the default model and API URL unless you
have verified that an alternative is supported by your Groq account.

## Verify after deployment

1. Open `/health` and confirm `ok: true` and `providerConfigured: true`.
2. Open `/api/capabilities` and confirm the service reports `ready`.
3. Send a harmless test message in the CODIS app.

## Security and current limitations

- The API key stays on the server; the Android app should call the backend and
  must never contain the provider key.
- The chat endpoint has an IP-based rate limit. This is a basic abuse control,
  not user authentication or a spending guarantee.
- The public chat API currently has no user accounts or per-user quotas. Anyone
  who discovers the public endpoint may attempt to use it, subject to the rate
  limit and provider-side limits. Monitor Groq usage and set provider limits
  where available.
- Chat history is stored locally on the Android device. The server does not yet
  provide cross-device memory or account-based history.
- CODIS does not currently perform autonomous external actions. Require user
  approval before adding integrations that can send, buy, book, delete, or alter
  accounts or devices.
