# AI Chat Feature

A production-ready AI chat interface for interacting with local LLM models via Ollama.

## Features

### 🎯 Core Functionality
- **Real-time Streaming**: See AI responses as they're generated
- **Conversation Management**: Create, view, and delete multiple conversations
- **Persistent Storage**: All conversations and messages saved to Convex database
- **Auto-title Generation**: Conversations automatically titled from first message
- **Context Window Optimization**: Sliding window (last 20 messages) to manage long conversations
- **Message Metadata**: Tracks model, duration, and tokens for analytics

### 🎨 User Experience
- **Smart Auto-scroll**: Scroll freely during streaming - auto-scroll resumes when you reach bottom
- **Scroll-to-bottom Button**: Quick navigation when viewing history
- **Empty States**: Helpful onboarding for new users
- **Loading States**: Clear feedback during operations
- **Error Handling**: Automatic retry logic with exponential backoff
- **Clean UI**: Simplified prompt form focused on core chat functionality
- **Mobile Optimized**: Full mobile support with drawer sidebar and responsive design

### ✨ Enhanced Markdown
- **Full Markdown Support**: Headers, lists, tables, blockquotes, links
- **Code Syntax Highlighting**: Beautiful code blocks with language detection
- **Copy Code Button**: One-click copy for all code blocks
- **HTML Support**: Renders `<br>` tags and other safe HTML
- **GitHub Flavored Markdown**: Tables, strikethrough, task lists

### ⌨️ Keyboard Shortcuts
- **Ctrl/Cmd + Shift + C**: Start new conversation
- **Enter**: Send message
- **Shift + Enter**: New line in message

### 🔒 Security & Protection
- **API Authentication**: Clerk-based authentication on all API routes
- **Rate Limiting**: 100 requests/hour per user (configurable)
- **Authorization Checks**: Server-side validation of conversation ownership
- **Input Validation**: Request validation at API layer
- **Comprehensive Logging**: Request tracking for debugging and monitoring

## Quick Start

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

**TL;DR:**
1. Create `.env.local` with Ollama configuration
2. Ensure Ollama is running: `ollama serve`
3. Restart dev server: `npm run dev`
4. Navigate to `/dashboard/ai-chat` and start chatting

## Configuration

### Required Environment Variables

```bash
OLLAMA_BASE_URL=http://localhost:11434    # Your Ollama server
OLLAMA_MODEL=gpt-oss:20b                  # Model to use
OLLAMA_TEMPERATURE=0.7                    # Creativity (0.0-1.0)
RATE_LIMIT_PER_HOUR=100                   # Requests per user/hour
```

See [docs/SETUP.md](docs/SETUP.md) for detailed configuration and deployment options.

## Production Deployment

For deploying to production where family/friends can access:

**Network Options:**
- **Tailscale/VPN** (Recommended): Secure, easy setup
- **Local Network**: Direct access on same network
- **Reverse Proxy**: For internet access with HTTPS

See [docs/SETUP.md](docs/SETUP.md) for detailed deployment instructions.

**Security Built-in:**
- ✅ Clerk authentication on all API routes
- ✅ Rate limiting (100 requests/hour per user)
- ✅ User-scoped conversations
- ✅ Request validation
- ✅ Comprehensive logging

**Performance Features:**
- Sliding window context (last 20 messages)
- Automatic retry with exponential backoff
- Real-time streaming responses
- Edge runtime for API routes

## Mobile Support

Fully responsive design with mobile-optimized UI:

**Mobile (<768px):**
- Drawer-style sidebar (80% screen width)
- Touch-optimized interactions
- Auto-closes on selection
- Responsive padding and spacing

**Desktop (≥768px):**
- Fixed collapsible sidebar
- Full keyboard shortcuts
- More screen real estate

## Browser Support

**Desktop:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

**Mobile:**
- iOS Safari 14+: Full support
- iOS Chrome 14+: Full support
- Android Chrome 80+: Full support
- Android Firefox 80+: Full support
- Samsung Internet 12+: Full support

## Future Enhancements

- [ ] Message editing and regeneration
- [ ] Export conversations (Markdown/PDF)
- [ ] System prompts customization
- [ ] Model selection UI
- [ ] Conversation search
- [ ] Message reactions/feedback
- [ ] Dark/light mode specific syntax themes
- [ ] Voice input support
- [ ] File attachments for context

## Troubleshooting

**AI not responding:**
- Check Ollama is running: `ollama list`
- Verify `OLLAMA_BASE_URL` in `.env.local`
- Test directly: `curl http://localhost:11434/api/tags`

**Authentication errors:**
- Ensure you're logged in with Clerk
- Clear browser cache and retry

**Rate limiting (429):**
- Wait for reset time (shown in error)
- Or increase `RATE_LIMIT_PER_HOUR` in `.env.local`

See [docs/SETUP.md](docs/SETUP.md) for detailed troubleshooting guide.

## Production Readiness Checklist

### ✅ Completed
- [x] **Security**: API route authentication with Clerk
- [x] **Security**: Rate limiting (100 req/hour per user)
- [x] **Security**: User-scoped data isolation
- [x] **Security**: Input validation and sanitization
- [x] **Configuration**: Environment variables for all settings
- [x] **Configuration**: Configurable Ollama URL, model, temperature
- [x] **Optimization**: Sliding window context (last 20 messages)
- [x] **Optimization**: Retry logic with exponential backoff
- [x] **Optimization**: Comprehensive error handling
- [x] **Optimization**: Performance logging and metrics
- [x] **UI**: Simplified prompt form (removed non-functional features)
- [x] **UI**: Error boundaries and loading states
- [x] **UI**: Responsive design with mobile optimization
- [x] **UI**: Collapsible sidebar for desktop
- [x] **UI**: Drawer sidebar for mobile
- [x] **UI**: Keyboard accessibility
- [x] **Database**: Message metadata (model, duration, tokens)
- [x] **Database**: Proper authorization checks
- [x] **Documentation**: Environment variables documented
- [x] **Documentation**: Deployment guide with network setup options
- [x] **Documentation**: Comprehensive troubleshooting guide

### 📋 Before Going Live
- [ ] Configure `.env.local` with production values
- [ ] Set up Ollama network access (Tailscale recommended)
- [ ] Test authentication and rate limiting
- [ ] Test on multiple devices and browsers
- [ ] Verify conversations are properly isolated by user
- [ ] Monitor logs for any errors or issues
- [ ] Brief users on how to access and use the feature

## License

Part of personal-dashboard project.

