# Airport Check-In Kiosk System - Frontend

Modern, responsive React frontend for the Airport Check-In Kiosk System.

## Features

- 🎨 **Modern UI**: Beautiful, intuitive interface with Tailwind CSS
- 🔄 **Real-time Updates**: WebSocket integration for live seat and baggage updates
- 📱 **Responsive Design**: Works seamlessly on all screen sizes
- ⚡ **Fast Performance**: Built with Vite for optimal development and production builds
- 🎯 **Type Safety**: Full TypeScript support for better code quality

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **STOMP.js** - WebSocket client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 22+ (LTS version)
- npm 10+ or yarn 4.0+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

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

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── BookingSearch.tsx
│   │   ├── SeatMap.tsx
│   │   ├── BaggageCheckIn.tsx
│   │   ├── BoardingPass.tsx
│   │   └── ErrorDisplay.tsx
│   ├── services/            # API and WebSocket services
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── store/               # Zustand state management
│   │   └── kioskStore.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── booking.ts
│   │   ├── flight.ts
│   │   ├── seat.ts
│   │   ├── baggage.ts
│   │   ├── boardingPass.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Features Overview

### 1. Booking Search

- Search by booking reference or passport number
- Clean, intuitive search interface
- Error handling and loading states

### 2. Seat Selection

- Interactive seat map with real-time updates
- Visual indicators for seat status (available, locked, reserved)
- Seat locking with TTL (30 seconds)
- WebSocket integration for live updates
- Automatic unlock of previous seat when selecting a new one
- One seat per booking enforcement

### 3. Baggage Check-In

- Enter baggage count and weight
- Real-time baggage count updates
- Skip option for passengers without baggage

### 4. Boarding Pass

- Generate boarding pass with QR code
- Print and download functionality
- Beautiful, printable design

### 5. Flight Information & Seat Assignments

- View flight schedules and details
- Real-time seat assignments table
- Passenger manifest with seat numbers
- Booking reference and passport information

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8080/api)
- `VITE_WS_URL` - WebSocket server URL (default: http://localhost:8080/ws)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Airport Check-In Kiosk System assignment.
