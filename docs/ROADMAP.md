# CODIS Intelligence Roadmap

## Product goal

Build CODIS into a reliable personal AI system that can research, reason, remember useful context, use approved tools, and complete delegated tasks. Progress is measured by correctness, usefulness, safety, and reliability—not by the amount of data collected or claims of being the world's most intelligent AI.

## Current foundation

- Android WebView application with voice input/output support where the device browser provides it.
- Node.js/Express API hosted on Render.
- Groq model configuration defaults to `openai/gpt-oss-120b`.
- Built-in browser search and sandboxed code execution are enabled in the backend request configuration.
- Recent conversation history is saved in browser local storage on the current device.
- Health and capability endpoints expose service readiness and implemented features.
- API input limits, request rate limits, provider timeouts, and sanitized client errors are in place.
- Backend smoke tests run in GitHub Actions.

## Important current limitations

- The Groq API key must be configured in Render before AI chat requests can succeed.
- Browser-local conversation memory is not synchronized across devices and can be erased with app/browser data.
- There is no user account system or authenticated multi-user memory store yet.
- CODIS does not currently execute actions on the user's phone or external accounts.
- Code execution is a provider-managed sandbox, not unrestricted access to the CODIS server or Android device.
- Production deployment must be verified after each backend change.

## Development phases

### Phase 1 — Reliable AI foundation

- Keep the API deployable and observable.
- Test health, capabilities, validation, rate limits, provider failures, and successful model responses.
- Verify browser search and code execution with live requests after the provider key is configured.
- Track model and provider usage, latency, and errors without logging secrets or private message contents.

### Phase 2 — Long-term memory

- Add explicit user accounts and secure authentication before storing cross-device personal memories.
- Store conversations and user-approved memories separately.
- Add memory controls: view, correct, export, and delete.
- Retrieve only relevant memories for each request, with source and date metadata.
- Distinguish user facts, preferences, project context, and temporary conversation details.
- Do not silently infer or store sensitive information.

### Phase 3 — Knowledge and research

- Add document ingestion for user-provided files and approved data sources.
- Extract, chunk, index, and retrieve content with source references.
- Preserve source URLs, timestamps, and provenance.
- Re-check changing claims against current sources and show uncertainty where evidence is incomplete.
- Avoid collecting data that CODIS has no lawful or useful reason to process.

### Phase 4 — Tool and task system

- Create a registry of tools with clear schemas, permissions, and audit logs.
- Start with low-risk read-only integrations.
- Require confirmation for purchases, messages, account changes, deletions, financial actions, or device-control actions.
- Add task planning, checkpoints, retries, and recovery from partial failures.
- Never claim an action succeeded until the connected service confirms it.

### Phase 5 — Model routing and specialist skills

- Benchmark multiple models on CODIS tasks for accuracy, speed, cost, and tool reliability.
- Route tasks to the best available model rather than assuming one model is always best.
- Add specialist workflows for research, coding, planning, and data analysis.
- Keep provider credentials server-side and support safe model/provider fallback.

### Phase 6 — Evaluation and controlled improvement

- Maintain a test set of real CODIS tasks and expected outcomes.
- Score factual accuracy, citation quality, task completion, latency, and cost.
- Run regression tests before releases.
- Let CODIS suggest code improvements, create isolated test changes, and report results.
- Require review and explicit approval before production code or permission changes.

## Design principles

1. Accuracy over confidence.
2. Useful memory over indiscriminate data collection.
3. Least-privilege access to tools and accounts.
4. User control over stored personal information.
5. Transparent reporting of uncertainty and failed actions.
6. Reproducible tests and measured improvements.
7. No autonomous changes to production systems without an approval gate.
