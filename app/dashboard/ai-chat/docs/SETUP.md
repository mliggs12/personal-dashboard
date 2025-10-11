# AI Chat Setup Guide

## Quick Start (5 Minutes)

### 1. Configure Environment Variables

Create `.env.local` in your project root:

```bash
# AI Chat Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
OLLAMA_TEMPERATURE=0.7
RATE_LIMIT_PER_HOUR=100
```

### 2. Ensure Ollama is Running

```bash
# Check if Ollama is running
ollama list

# If not running, start it
ollama serve
```

### 3. Restart Development Server

```bash
npm run dev
```

### 4. Test the Feature

1. Navigate to `/dashboard/ai-chat`
2. Click "Start New Conversation"
3. Send a test message
4. Verify streaming response works

## Production Deployment

### Network Setup for Self-Hosted Ollama

Choose one of these options:

#### Option 1: Tailscale (Recommended)
Best for security and simplicity:

1. Install Tailscale on both your PC and deployment server
2. Get your PC's Tailscale IP: `tailscale ip -4`
3. Update `.env`: `OLLAMA_BASE_URL=http://100.x.x.x:11434`

#### Option 2: Local Network
If Ollama and app are on same network:

1. Configure Ollama to listen on all interfaces:
   ```bash
   # Windows (PowerShell as Admin)
   $env:OLLAMA_HOST="0.0.0.0:11434"
   ollama serve
   
   # Linux/Mac
   OLLAMA_HOST=0.0.0.0:11434 ollama serve
   ```

2. Get your PC's local IP and update `.env`:
   ```bash
   OLLAMA_BASE_URL=http://192.168.1.100:11434
   ```

3. Configure firewall to allow port 11434

## Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OLLAMA_BASE_URL` | URL to Ollama instance | `http://localhost:11434` | `http://192.168.1.100:11434` |
| `OLLAMA_MODEL` | AI model to use | `gpt-oss:20b` | `llama3.1:8b` |
| `OLLAMA_TEMPERATURE` | Creativity level (0.0-1.0) | `0.7` | `0.8` |
| `RATE_LIMIT_PER_HOUR` | Max requests per user/hour | `100` | `200` |

## Troubleshooting

### AI not responding
1. Check Ollama is running: `ollama list`
2. Verify `OLLAMA_BASE_URL` in `.env.local`
3. Test directly: `curl http://localhost:11434/api/tags`
4. Check browser console for errors

### "Authentication required" error
1. Ensure you're logged in with Clerk
2. Clear browser cache and cookies
3. Try logging in again

### Rate limiting (429 error)
1. Wait for reset (time shown in error)
2. Or increase `RATE_LIMIT_PER_HOUR` in `.env.local`

### Mobile drawer not opening
1. Check if on mobile viewport (<768px)
2. Verify Sheet component is rendering
3. Check console for JavaScript errors

## Testing Checklist

Before deployment:

- [ ] Test with Ollama running
- [ ] Test authentication (try logging out)
- [ ] Test rate limiting (make 100+ requests)
- [ ] Test long conversation (10+ messages)
- [ ] Test on mobile device
- [ ] Test error handling (stop Ollama mid-chat)
- [ ] Verify conversations are user-specific

## Next Steps

- Configure production environment variables
- Set up network access to Ollama
- Test with family/friends
- Monitor logs for issues
- Collect feedback

For detailed feature documentation, see [README.md](../README.md)

