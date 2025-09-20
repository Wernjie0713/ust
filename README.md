# EcoGo! — Next.js (TypeScript)

**EcoGo!** is a gamified recycling platform that turns environmental action into an engaging experience. Collect EcoMons, earn rewards, and make a positive impact on the planet!

## ✨ Features

- 🗺️ **Interactive Map**: Discover recycling stations and track your impact
- 📸 **Smart Camera**: AI-powered waste analysis and sorting
- 🎮 **EcoMon Collection**: Collect and battle digital creatures representing waste types
- 🏆 **Achievements & Rewards**: Earn points, tokens, and unlock special rewards
- 👤 **User Profiles**: Track your recycling stats and environmental impact
- 🔄 **Voucher System**: Redeem rewards for real-world impact
- 👥 **Community Features**: Share achievements and compete with friends

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Environment variables (see below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecogo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local
```

Required environment variables:
```env
API_BASE_URL=http://localhost:3003
MAPBOX_TOKEN=your_mapbox_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see EcoGo! in action.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run scan:banned` - Check for banned terms (blockchain references)
- `npm run smoke` - Run smoke tests on all routes
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **AI**: OpenAI Vision API (server-side proxy)
- **State**: React hooks + localStorage

### Key Components
- `pages/` - Next.js pages and API routes
- `components/ecomon/` - EcoMon game components
- `components/navigation/` - App navigation
- `utils/auth.ts` - Authentication utilities
- `reports/` - Refactor inventory and documentation

## 🔒 Security & Privacy

- **No blockchain dependencies** - Clean, lightweight architecture
- **Server-side API proxies** - Mapbox and OpenAI keys never exposed to client
- **UUID-based user IDs** - Simple, secure user identification
- **Local storage** - User data stored client-side for demo purposes

## 🧪 Quality Assurance

### Automated Checks
- **Banned Terms Scanner**: Ensures no blockchain references remain
- **Smoke Tests**: Validates all routes load successfully
- **TypeScript**: Full type safety across the application

### Testing
```bash
# Run banned terms check
npm run scan:banned

# Run smoke tests
npm run smoke

# Build and verify
npm run build
npm run start
```

## 📱 Pages & Features

- `/` - Home dashboard with stats and quick actions
- `/map` - Interactive recycling station map
- `/camera` - AI-powered waste analysis camera
- `/rewards` - Voucher redemption and rewards
- `/achievements` - User achievements and milestones
- `/profile` - User profile with EcoMon collection
- `/game` - EcoMon battle and collection game
- `/review` - Community review system
- `/recycler` - Recycler dashboard
- `/recycler/users` - User management for recyclers
- `/recycler/camera` - Camera tools for recyclers

## 🎯 Development Notes

- **UUID-based IDs**: All user and EcoMon IDs use secure UUID format
- **Clean Architecture**: Removed wallet integration for lightweight design
- **API Proxies**: `/api/map/token`, `/api/analyze`, `/api/vouchers`
- **Clean Architecture**: No external wallet or blockchain dependencies

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Setup
Ensure all required environment variables are set in your deployment platform:
- `API_BASE_URL` - Backend API URL
- `MAPBOX_TOKEN` - Mapbox access token
- `OPENAI_API_KEY` - OpenAI API key

## 📝 License

This project is part of the EcoGo! environmental initiative.

---

**Made with ❤️ for the planet** 🌱
