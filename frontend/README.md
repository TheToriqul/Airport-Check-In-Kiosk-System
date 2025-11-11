# Airport Check-In Kiosk System - Frontend

Modern, responsive React frontend for the Airport Check-In Kiosk System with real-time updates.

## Technology Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Zustand 5.0** - State management
- **Axios 1.13** - HTTP client
- **@stomp/stompjs 7.2** - WebSocket client (STOMP)
- **sockjs-client 1.6** - WebSocket fallback
- **Lucide React 0.553** - Icon library
- **qrcode.react 4.2** - QR code generation

## Prerequisites

- **Node.js 22+** (LTS version)
- **npm 10+** or yarn 4.0+

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory (optional, defaults are set):

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── AirportServicesPage.tsx
│   │   ├── BaggageCheckIn.tsx
│   │   ├── BoardingPass.tsx
│   │   ├── BookingSearch.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── FlightDetailsPage.tsx
│   │   ├── Navigation.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SeatMap.tsx
│   │   └── TerminalMapPage.tsx
│   ├── services/            # API and WebSocket services
│   │   ├── api.ts           # REST API client
│   │   ├── websocket.ts     # WebSocket service
│   │   └── healthCheck.ts   # Health check utility
│   ├── store/               # Zustand state management
│   │   └── kioskStore.ts    # Global application state
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── baggage.ts
│   │   ├── boardingPass.ts
│   │   ├── booking.ts
│   │   ├── flight.ts
│   │   ├── seat.ts
│   │   ├── seatAssignment.ts
│   │   └── index.ts
│   ├── assets/              # Static assets
│   │   └── image/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles with Tailwind
│   └── vite-env.d.ts        # Vite type declarations
├── public/                  # Static assets
│   ├── favicon.ico
│   └── logo.png
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Features Overview

### 1. Booking Search

- Search by booking reference or passport number
- Case-insensitive search (automatically converts booking references to uppercase)
- Clean, intuitive search interface
- Error handling and loading states
- Real-time validation

### 2. Seat Selection

- Interactive seat map with real-time updates via WebSocket
- Visual indicators for seat status:
  - **Green**: Available
  - **Yellow**: Locked by another user
  - **Red**: Reserved/Occupied
  - **Blue**: Selected (your current selection)
- Seat locking with TTL (30 seconds)
- Automatic unlock of previous seat when selecting a new one
- One seat per booking enforcement
- WebSocket integration for live updates across all kiosks

### 3. Baggage Check-In

- Enter baggage count (1-10) and weight (0.1-1000 kg)
- Real-time baggage count updates via WebSocket
- Skip option for passengers without baggage
- Input validation and error handling

### 4. Boarding Pass

- Generate boarding pass with QR code
- Print and download functionality
- Beautiful, printable design
- Displays all flight and passenger information

### 5. Flight Information & Seat Assignments

- View flight schedules and details
- Real-time seat assignments table showing:
  - Passenger name and email
  - Seat number and class
  - Booking reference
  - Passport number
- Passenger manifest for each flight
- Click on any flight to see detailed seat assignments

## Development

### Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8080/api)
- `VITE_WS_URL` - WebSocket server URL (default: http://localhost:8080/ws)

## API Integration

The frontend communicates with the backend through:

### REST API (via `services/api.ts`)
- Booking search and retrieval
- Seat map and assignments
- Seat locking and confirmation
- Baggage check-in
- Boarding pass generation

### WebSocket (via `services/websocket.ts`)
- Real-time seat status updates
- Real-time baggage count updates
- Automatic reconnection on disconnect

## State Management

Uses **Zustand** for global state management:

- Booking and flight information
- Seat map and selected seat
- Baggage information
- Boarding pass data
- UI state (loading, errors, current step)
- Session management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Key Features

### Case-Insensitive Input Handling
- Booking references are automatically converted to uppercase
- Passport numbers preserve their original case
- All inputs are trimmed before sending to API

### Real-Time Updates
- WebSocket connection for live seat map updates
- Automatic reconnection on connection loss
- Optimistic UI updates with server confirmation

### Error Handling
- Comprehensive error messages
- Network error handling
- Graceful degradation when backend is unavailable

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts for different screen sizes

## License

This project is part of the Airport Check-In Kiosk System assignment.
