# SkillLoop — Fullstack dApp Documentation

SkillLoop is a decentralized platform that enables peer-to-peer skill-sharing sessions with token incentives and NFT certificates. It utilizes a fullstack architecture with smart contracts (Solidity), backend (Next.js API routes), and frontend (Next.js with RainbowKit, Wagmi, TailwindCSS).

---

## Project Structure

```bash
skillloop/
├── contracts/             # Hardhat smart contracts (SkillToken, SkillEscrow, SkillBadgeNFT)
├── backend/               # Next.js backend API and helpers
│   ├── app/api/           # RESTful API routes for profile, match, session, certificate, faucet
│   ├── lib/db/            # MongoDB connection logic
│   ├── lib/contracts/     # Load and interact with deployed smart contracts
├── frontend/              # Next.js frontend
│   ├── pages/             # Landing, dashboard, profile, match, session, certificates
│   ├── components/        # Reusable UI components (Navbar, Sidebar, SessionCards, etc)
│   ├── styles/            # Tailwind global styles
│   ├── utils/             # Web3 helpers, hooks
│   └── public/            # Images, static assets
```

---

## Authentication

- **SIWE (Sign-In With Ethereum)** for protected routes
- Optional session storage via JWT or encrypted cookies
- Protect actions like:
  - Creating or confirming sessions
  - Editing user profiles

---

## Features

### Smart Contracts
- `SkillToken`: ERC20 token with faucet functionality
- `SkillEscrow`: Manages learning sessions and payments
- `SkillBadgeNFT`: ERC721 badge given upon session confirmation
- `SkillProfile` (optional): Stores user skills/preferences

### Backend API (Next.js)
- `/api/profile`: CRUD for user profile
- `/api/match`: Match users based on shared skill tags
- `/api/session`: Create sessions (writes to blockchain)
- `/api/session/[id]`: Fetch & confirm session (SkillEscrow.confirmSession)
- `/api/certificate/[wallet]`: Read NFTs owned by a user
- `/api/faucet`: Calls SkillToken.faucet for test tokens

### Frontend (Next.js + RainbowKit)
- Wallet Connect with RainbowKit
- Skill selection with react-select/creatable
- Session creation + confirmation flow
- Token balance display and faucet button
- NFT certificate gallery

---

## Pages & Components

### Pages

| Route | Description |
|-------|-------------|
| `/` | Hero section with value props, connect wallet CTA |
| `/dashboard` | Token balance, upcoming/past sessions, session history |
| `/profile/[wallet]` | View/edit name, bio, and skill tags |
| `/match` | Matchmaking based on selected skills |
| `/session/[id]` | Session info and confirmation |
| `/certificates` | NFT gallery from SkillBadgeNFT |
| `/session/create` | Form to create new sessions |

### Components

- **Navbar**: Auth-aware top navigation
- **Sidebar**: Dashboard route links
- **WalletConnectButton**: RainbowKit
- **SessionCard**: Displays session details
- **SkillTagInput**: Skill input (react-select)
- **FaucetButton**: Token faucet

---

## Testing

- **Backend**: Unit tests using Jest or Supertest for API endpoints
- **Smart Contracts**: Hardhat + Chai tests for SkillToken, SkillEscrow, SkillBadgeNFT
- **Frontend**: React testing library + Jest (optional)

---

## Deployment

- Contracts deployed to **Ethereum Sepolia**
- Exported ABIs stored in `frontend-exports/` and imported into frontend/backend
- Environment Variables required:
  - `.env.local` (MongoDB URI, RPC URL, contract addresses)

---

## Scripts

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## License

MIT

---

Built by Yusasive as part of the SkillLoop Innovation Project at University of Ilorin.