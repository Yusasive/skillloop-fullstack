# SkillLoop Mobile App Development Prompt

## Project Overview
Develop a cross-platform mobile application for SkillLoop, a decentralized peer-to-peer learning platform. The mobile app should provide a seamless, native experience while maintaining full Web3 functionality and feature parity with the web platform.

## Technical Requirements

### Platform & Framework
- **Framework**: React Native with Expo (latest stable version)
- **Language**: TypeScript for type safety
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Navigation**: React Navigation v6 with stack, tab, and drawer navigators
- **Styling**: NativeWind (Tailwind CSS for React Native) + React Native Elements
- **Web3 Integration**: WalletConnect v2 + ethers.js v6
- **Database**: Same MongoDB backend as web app (shared API endpoints)

### Architecture Requirements
- **Clean Architecture**: Separate presentation, domain, and data layers
- **Modular Structure**: Feature-based folder organization
- **Offline Support**: Redux Persist for offline data caching
- **Performance**: Lazy loading, image optimization, and memory management
- **Security**: Secure storage for sensitive data, biometric authentication

## Core Features to Implement

### 1. Authentication & Wallet Integration
- **WalletConnect Integration**: Support major mobile wallets (MetaMask, Trust Wallet, Coinbase Wallet)
- **Biometric Authentication**: Face ID/Touch ID for quick app access
- **Session Management**: Persistent login with secure token storage
- **Multi-wallet Support**: Allow users to connect multiple wallets

### 2. User Profile Management
- **Profile Creation/Editing**: Native forms with image picker for avatars
- **Skill Management**: Add/remove teaching and learning skills
- **Portfolio Display**: Showcase completed sessions and certificates
- **Settings**: Notifications, privacy, and app preferences

### 3. Discovery & Search
- **Tutor Discovery**: Swipeable cards interface for browsing tutors
- **Advanced Filters**: Filter by skill, rating, price, availability
- **Search Functionality**: Real-time search with autocomplete
- **Favorites**: Save preferred tutors for quick access

### 4. Session Management
- **Session Booking**: Intuitive booking flow with calendar integration
- **Session Dashboard**: Overview of upcoming, ongoing, and completed sessions
- **In-Session Features**: 
  - Video calling integration (Agora.io or similar)
  - Progress tracking with milestone checkboxes
  - Real-time chat and file sharing
  - Screen sharing capabilities
- **Session Controls**: Start, pause, complete session with progress validation

### 5. Learning Marketplace
- **Learning Requests**: Create and manage learning requests
- **Bidding System**: Submit and manage bids with push notifications
- **Request Management**: Accept/reject bids with scheduling integration

### 6. Token & Payment System
- **Token Balance Display**: Real-time SKL token balance
- **Transaction History**: Detailed transaction logs with status tracking
- **Escrow Management**: Visual representation of locked tokens
- **Payment Flows**: Seamless token transfers with confirmation screens

### 7. NFT Certificates
- **Certificate Gallery**: Visual display of earned NFT certificates
- **Certificate Details**: Expandable views with metadata and verification
- **Sharing Features**: Share certificates on social media
- **Minting Interface**: One-tap NFT minting with progress indicators

### 8. Notifications & Communication
- **Push Notifications**: Real-time updates for sessions, bids, and messages
- **In-App Messaging**: Direct messaging between tutors and students
- **Notification Center**: Categorized notifications with action buttons
- **Email Integration**: Optional email notifications for important events

### 9. Progress Tracking & Analytics
- **Learning Dashboard**: Visual progress tracking with charts
- **Session Analytics**: Time spent, skills learned, progress metrics
- **Achievement System**: Badges and milestones for engagement
- **Learning Streaks**: Gamification elements to encourage regular learning

## UI/UX Design Requirements

### Design System
- **Color Scheme**: Match web app's design tokens and color palette
- **Typography**: Inter font family with proper scaling for mobile
- **Components**: Consistent component library with proper touch targets
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Dark Mode**: Full dark mode support with system preference detection

### Mobile-Specific UX Patterns
- **Bottom Tab Navigation**: Primary navigation with 5 tabs (Home, Discover, Sessions, Certificates, Profile)
- **Swipe Gestures**: Swipe to refresh, swipe between tabs, swipe cards
- **Pull-to-Refresh**: Standard mobile refresh patterns
- **Haptic Feedback**: Tactile feedback for important actions
- **Adaptive Layouts**: Responsive design for tablets and different screen sizes

### Key Screens & Flows

#### Onboarding Flow
1. **Welcome Screen**: App introduction with key benefits
2. **Wallet Connection**: WalletConnect integration with wallet selection
3. **Profile Setup**: Guided profile creation with skill selection
4. **Tutorial**: Interactive tutorial highlighting key features
5. **Permissions**: Request necessary permissions (camera, notifications, etc.)

#### Main Navigation Tabs
1. **Home**: Dashboard with recent activity, quick actions, and recommendations
2. **Discover**: Tutor discovery with filters and search
3. **Sessions**: Session management with calendar view
4. **Certificates**: NFT certificate gallery
5. **Profile**: User profile and settings

#### Critical User Flows
- **Book a Session**: Tutor selection → Skill selection → Date/time → Payment confirmation
- **Conduct a Session**: Pre-session prep → Video call → Progress tracking → Completion
- **Create Learning Request**: Skill input → Requirements → Budget → Publish
- **Manage Bids**: View bids → Compare offers → Accept/reject → Schedule session

## Technical Implementation Details

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, inputs, etc.)
│   ├── forms/           # Form components
│   ├── navigation/      # Navigation components
│   └── web3/           # Web3-specific components
├── screens/             # Screen components organized by feature
│   ├── auth/           # Authentication screens
│   ├── profile/        # Profile management screens
│   ├── sessions/       # Session-related screens
│   ├── discovery/      # Tutor discovery screens
│   └── certificates/   # Certificate screens
├── services/           # API services and Web3 interactions
│   ├── api/           # REST API calls
│   ├── web3/          # Blockchain interactions
│   └── storage/       # Local storage management
├── store/              # Redux store configuration
│   ├── slices/        # Redux slices for different features
│   └── middleware/    # Custom middleware
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
└── hooks/              # Custom React hooks
```

### State Management Architecture
- **Redux Slices**: Separate slices for auth, sessions, users, certificates, notifications
- **RTK Query**: API endpoints with caching and background refetching
- **Offline Support**: Redux Persist with selective persistence
- **Optimistic Updates**: Immediate UI updates with rollback on failure

### Web3 Integration
- **WalletConnect v2**: Universal wallet connection with deep linking
- **Ethers.js**: Blockchain interactions and smart contract calls
- **Token Management**: SKL token balance tracking and transaction handling
- **NFT Support**: Certificate viewing and minting functionality

### Performance Optimizations
- **Image Optimization**: Lazy loading, caching, and compression
- **Bundle Splitting**: Code splitting by feature and route
- **Memory Management**: Proper cleanup of listeners and subscriptions
- **Background Tasks**: Efficient background sync and updates

### Security Considerations
- **Secure Storage**: Encrypted storage for sensitive data
- **API Security**: Request signing and rate limiting
- **Input Validation**: Client-side and server-side validation
- **Privacy**: Minimal data collection with user consent

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup with Expo and TypeScript
- Basic navigation structure
- Web3 wallet integration
- Authentication flow
- Basic UI component library

### Phase 2: Core Features (Weeks 3-5)
- User profile management
- Tutor discovery and search
- Session booking flow
- Basic session management
- Token balance display

### Phase 3: Advanced Features (Weeks 6-8)
- Video calling integration
- Progress tracking system
- Learning marketplace
- NFT certificate management
- Push notifications

### Phase 4: Polish & Testing (Weeks 9-10)
- UI/UX refinements
- Performance optimizations
- Comprehensive testing
- App store preparation
- Beta testing with users

## Testing Strategy
- **Unit Tests**: Jest for utility functions and business logic
- **Component Tests**: React Native Testing Library
- **Integration Tests**: API integration and Web3 functionality
- **E2E Tests**: Detox for critical user flows
- **Performance Tests**: Flipper integration for performance monitoring

## Deployment & Distribution
- **Development**: Expo Development Build for testing
- **Staging**: TestFlight (iOS) and Google Play Internal Testing (Android)
- **Production**: App Store and Google Play Store
- **Updates**: Over-the-air updates via Expo Updates

## Success Metrics
- **User Engagement**: Daily/monthly active users, session completion rates
- **Performance**: App load time, crash rate, memory usage
- **Business Metrics**: Sessions booked, tokens transacted, certificates earned
- **User Satisfaction**: App store ratings, user feedback, retention rates

## Additional Considerations
- **Accessibility**: Full VoiceOver/TalkBack support
- **Internationalization**: Multi-language support preparation
- **Analytics**: User behavior tracking with privacy compliance
- **Crash Reporting**: Sentry or similar for error monitoring
- **Feature Flags**: Remote configuration for gradual feature rollouts

## Development Team Requirements
- **React Native Developer**: 3+ years experience with Expo
- **Web3 Developer**: Experience with WalletConnect and mobile Web3
- **UI/UX Designer**: Mobile-first design experience
- **QA Engineer**: Mobile testing expertise
- **DevOps Engineer**: Mobile CI/CD and app store deployment

This mobile app should provide a superior user experience compared to the web version while maintaining all the core functionality that makes SkillLoop unique in the decentralized learning space.