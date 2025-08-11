# SkillLoop - Decentralized Learning Platform

SkillLoop is a Web3-powered peer-to-peer learning platform that connects learners with tutors, facilitates secure token-based transactions, and issues on-chain certificates for completed learning sessions.

## Features

-  **Web3 Authentication**: Connect with MetaMask or other Web3 wallets
-  **Skill Profiles**: Create profiles showcasing teaching skills and learning interests
-  **Session Scheduling**: Book learning sessions with secure token escrow
-  **Smart Contract Escrow**: Automatically handle token transfers upon session completion
-  **NFT Certificates**: Earn on-chain proof of completed learning sessions
-  **Review System**: Build reputation through peer reviews and ratings

## Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Authentication**: Web3 Wallet Integration
- **Styling**: Tailwind CSS with custom theme

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- MongoDB instance
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yusasive/skillloop.git
cd skillloop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Web3
NEXT_PUBLIC_RPC_URL=your_infura_or_alchemy_url
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=deployed_escrow_contract_address
NEXT_PUBLIC_CERTIFICATE_CONTRACT_ADDRESS=deployed_certificate_contract_address
```

4. Deploy smart contracts:
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network sepolia
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Smart Contracts

### SkillLoopEscrow.sol
- Handles token escrow for learning sessions
- Manages session creation, confirmation, and cancellation
- Automatically releases tokens upon session completion

### SkillLoopCertificate.sol
- ERC721 contract for issuing learning certificates
- Mints unique NFTs for completed sessions
- Stores certificate metadata and verification details

## Project Structure

```
skillloop/
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── pages/             # Page components
├── contracts/             # Smart contracts
├── lib/                   # Utility functions
├── context/              # React context providers
└── public/               # Static assets
```

## API Routes

- `/api/users` - User profile management
- `/api/sessions` - Learning session operations
- `/api/certificates` - NFT certificate management
- `/api/reviews` - Review and rating system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)