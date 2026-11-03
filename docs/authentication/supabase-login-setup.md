# CODIS login setup (Supabase)

CODIS uses Supabase Auth for email/password accounts. The Android app talks to Supabase Auth over HTTPS, then sends its access token to the CODIS API. The API validates that token with Supabase before allowing AI chat.

## 1. Create a Supabase project
1. Open https://supabase.com/dashboard and sign in or create an account.
2. Create a new project. Keep the database password private; CODIS does not need it for login.
3. In Project Settings → API, copy the Project URL and the public anon/publishable key.
4. Never use or share the service_role/secret key in the Android app or a chat.

## 2. Configure the CODIS Android app
Open the app's “CODIS account” section and enter:
- Supabase project URL
- Public anon/publishable key
- Email and password

Choose Create account. If email confirmation is enabled, confirm the email first, then sign in.

## 3. Configure the CODIS server
In Render → codis-ai → Environment, add these variables:
- SUPABASE_URL = the Supabase Project URL
- SUPABASE_ANON_KEY = the public anon/publishable key

Keep the existing GROQ_API_KEY unchanged. Save the environment changes and wait for Render to finish deploying.

## 4. Verify
- Sign in to CODIS in the Android app.
- Send a test message.
- The API verifies the bearer token against Supabase before sending the prompt to the AI provider.

## Security notes
- The public anon/publishable key is intended for client apps; never put a service-role key in the app.
- Passwords are sent directly to Supabase Auth and are not stored by CODIS.
- CODIS does not accept a user ID from the client as proof of identity.
- Current chat history remains device-local. Persistent cross-device memory is a separate milestone and must be scoped to the verified user ID.
- Email confirmation and password recovery should be tested before production use.
