# 🏢 AI-Native Business Operating System

A fully autonomous AI business management system powered by Claude Sonnet 4.5. The Magentic Manager (AI CEO) builds and manages teams of AI agents to execute strategic directives 24/7.

## 🎯 What This Does

Give the Magentic Manager a strategic directive (e.g., "Build an HVAC SaaS product"), and it will:

1. **Analyze** your directive and break it down into actionable tasks
2. **Hire** the right AI agents dynamically (no redeployment needed)
3. **Delegate** tasks to specialized agents (Research, Dev, Marketing, Data, Customer Success)
4. **Execute** 24/7 autonomously
5. **Request approval** for major decisions (HITL - Human-in-the-Loop)
6. **Report progress** through the Observatory dashboard

## ✨ Key Features

### 🤖 Magentic Manager (AI CEO)
- **Strategic decision-making** using Claude Sonnet 4.5
- **Dynamic team building** - hires agents on-the-fly based on needs
- **24/7 autonomous operation** - works while you sleep
- **HITL approval system** - requests permission for:
  - Budget over $150/day
  - Strategic pivots
  - New business initiatives
  - High-cost agent hiring (>$5/day)

### 👥 AI Agent System
- **5 pre-built agent types**:
  - Research Agent (market research, competitor analysis)
  - Developer Agent (code, APIs, deployment)
  - Marketing Agent (content, SEO, campaigns)
  - Data Agent (analysis, visualization, insights)
  - Customer Success Agent (support, communication)
- **Custom agents** - Manager creates specialized agents as needed
- **Performance tracking** - Monitors agent productivity
- **Cost tracking** - Tracks spending per agent

### 🎛️ The Observatory Dashboard
- **Real-time stats** - Directives, team size, approvals, goals
- **Chat interface** - Talk directly with the Magentic Manager
- **HITL approval queue** - Review and approve requests
- **Team overview** - See all active agents and their status
- **Directive tracking** - Monitor progress on strategic initiatives

### 🔄 Background Worker
- **5-minute strategic loops** - Continuously assesses and acts
- **Automatic task delegation** - Assigns work to available agents
- **Progress monitoring** - Tracks completion and blockers
- **Self-healing** - Adapts to failures and changes

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- MySQL database
- Anthropic API key

### Local Development

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd ai-business-os
   pnpm install
   ```

2. **Set up environment** (`.env`):
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/ai_business_os
   ANTHROPIC_API_KEY=sk-ant-...
   JWT_SECRET=<random-secret>
   # ... see .env.example for full list
   ```

3. **Initialize database**:
   ```bash
   pnpm db:push
   ```

4. **Start dev server**:
   ```bash
   pnpm dev
   ```

5. **Open**: http://localhost:3000

### Deploy to Railway

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy**:
1. Push to GitHub
2. Create Railway project from GitHub repo
3. Add MySQL database
4. Set environment variables
5. Deploy automatically

## 📖 How to Use

### 1. Create a Directive

Click "+ New Directive" and describe what you want to accomplish:

**Example**:
```
Title: Build HVAC SaaS Product

Strategic Context:
- Target: Small to medium HVAC businesses
- Features: Scheduling, dispatch, customer management
- Tech stack: Modern web, mobile-friendly
- Timeline: MVP in 90 days
- Budget: $10k/month max
```

### 2. Watch the Magic

The Magentic Manager will:
- Analyze your directive
- Hire necessary agents (e.g., Research, Dev, Marketing)
- Create and assign tasks
- Start executing immediately

### 3. Monitor Progress

- **Observatory Dashboard**: See team activity and progress
- **Chat**: Ask the Manager for updates
- **HITL Queue**: Approve major decisions

### 4. Approve Requests

When the Manager needs permission:
- Budget increase
- Strategic pivot
- High-cost hiring

You'll get a notification in the "Needs Approval" section.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    The Observatory (UI)                     │
│  Dashboard · Chat · Directives · Team · HITL Approvals     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     tRPC API Layer                          │
│  directive · agent · task · hitl · message · orchestrator  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Magentic Manager (AI CEO)                  │
│  Strategic Loop · Decision Making · Team Building           │
│  Powered by Claude Sonnet 4.5                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent Workers                         │
│  Research · Dev · Marketing · Data · Customer Success       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
│  directives · agents · tasks · messages · hitl · actions    │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

- **directives** - Strategic goals from the user
- **agentTemplates** - Types of agents available
- **agents** - Active agent instances
- **tasks** - Work items assigned to agents
- **agentActions** - Audit log of agent activities
- **hitlRequests** - Human approval requests
- **messages** - Chat and communication history
- **principles** - Operating principles (living document)
- **goals** - Business goals and metrics
- **workSessions** - 24/7 operation tracking

## 💰 Cost Structure

### Infrastructure
- **Railway**: $5-20/month (Hobby to Pro plan)
- **MySQL**: ~$5-10/month

### AI Costs
- **Claude Sonnet 4.5**: ~$3-15 per million tokens
- **Estimated daily**: $5-20 depending on activity
- **Budget controls**: HITL approval for >$150/day

### Agent Costs (Simulated)
- Research Agent: $0.40/hour
- Developer Agent: $0.80/hour
- Marketing Agent: $0.50/hour
- Data Agent: $0.60/hour
- Customer Success: $0.45/hour

*Note: Agent costs are tracked in the system but not actual charges*

## 🔒 Security & Privacy

- **Authentication**: Manus OAuth integration
- **Session management**: JWT with secure cookies
- **API keys**: Stored in environment variables
- **Database**: Encrypted connections
- **HITL**: Human approval for sensitive operations

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database
- **MySQL** - Data storage
- **Claude Sonnet 4.5** - AI reasoning

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Routing
- **TanStack Query** - Data fetching

### Infrastructure
- **Railway** - Deployment
- **Vite** - Build tool
- **TypeScript** - Type safety

## 📊 Monitoring

### Built-in
- Agent performance scores
- Task completion rates
- Cost tracking
- HITL request history

### Recommended Add-ons
- **Sentry** - Error tracking
- **Plausible** - Analytics
- **LogRocket** - Session replay

## 🧪 Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm check

# Format code
pnpm format
```

## 📝 Development

### Project Structure
```
ai-business-os/
├── client/           # Frontend React app
│   ├── src/
│   │   ├── pages/   # Page components
│   │   ├── components/ # UI components
│   │   └── lib/     # Utilities
├── server/          # Backend
│   ├── _core/       # Framework code
│   ├── routers.ts   # tRPC routes
│   ├── orchestrator.ts # Magentic Manager
│   ├── worker.ts    # Background worker
│   ├── claude.ts    # Claude API client
│   ├── agentDb.ts   # Database helpers
│   └── seedData.ts  # Initial data
├── drizzle/         # Database schema
└── shared/          # Shared types
```

### Adding New Features

1. **Database**: Update `drizzle/schema.ts`
2. **Backend**: Add helpers in `server/agentDb.ts`
3. **API**: Add routes in `server/routers.ts`
4. **Frontend**: Create pages in `client/src/pages/`

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- **Anthropic** - Claude Sonnet 4.5
- **Railway** - Deployment platform
- **shadcn/ui** - Beautiful components

---

Built with ❤️ using AI-native principles

