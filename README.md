# Nabaha: EduChat AI
Vibes AlUla workshop project.

## OBJECTIVE:
Create a user-friendly website that allows students to:
- Upload PDF documents related to their study materials
- Purchase 1 or more private AI chat sessions
- Receive tailored questions based on uploaded documents
- Get personalized summaries, clarification of weak points, and memory-refreshers
- Receive skill evaluation based on answers (weakness = below 60%)

## CORE FEATURES:
### User Experience (UX):
- Clean, minimal UI
- Dark mode toggle
- Fully responsive (mobile/desktop)
- User accounts (login, settings, chat history)

### Chat Logic (AI-Powered):
- Detect if uploaded PDFs are about the same topic (semantic similarity)
- Ask context-specific questions from the content
- Generate tailored summaries & clarifications upon request
- Evaluate answers, highlight weak points (% score)
- Limit each chat’s lifetime to 3 months after first use
- Prevent sharing links of chats

### Functional Modules:
- PDF file upload + extract text
- AI Chat session with purchase logic
- Summary & feedback generator
- Evaluation engine (with weak point tracking)
- Login allowed on multiple devices but only within same geo-location (IP or GPS check)
- Support ticket system or live chat support

### Security:
- No sharing of chat links
- Auth system with multi-device detection + geo-verification

## REQUEST:
1. Suggest a suitable tech stack (backend + frontend + AI integration)
2. Recommend database schema (User, ChatSession, FileUpload, Evaluation)
3. Suggest the AI model (ChatGPT API, Claude, or custom LLM?)
4. Propose basic architecture and flow
