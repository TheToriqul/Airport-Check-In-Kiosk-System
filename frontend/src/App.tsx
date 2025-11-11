import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingSearch from './components/BookingSearch';
import SeatMap from './components/SeatMap';
import BaggageCheckIn from './components/BaggageCheckIn';
import BoardingPass from './components/BoardingPass';
import ErrorDisplay from './components/ErrorDisplay';
import Navigation from './components/Navigation';
import ProgressBar from './components/ProgressBar';
import FlightDetailsPage from './components/FlightDetailsPage';
import AirportServicesPage from './components/AirportServicesPage';
import TerminalMapPage from './components/TerminalMapPage';
import { useKioskStore } from './store/kioskStore';
import { checkBackendHealth } from './services/healthCheck';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { currentStep, activePage } = useKioskStore();

  // Show menu pages if active
  if (activePage) {
    switch (activePage) {
      case 'flight-details':
        return <FlightDetailsPage />;
      case 'terminal-map':
        return <TerminalMapPage />;
      case 'services':
        return <AirportServicesPage />;
      default:
        return <BookingSearch />;
    }
  }

  // Show main app content
  switch (currentStep) {
    case 'seat-selection':
      return <SeatMap />;
    case 'baggage':
      return <BaggageCheckIn />;
    case 'boarding-pass':
      return <BoardingPass />;
    case 'search':
    default:
      return <BookingSearch />;
  }
}

function App() {
  useEffect(() => {
    // Check backend health on app start
    checkBackendHealth().then((isHealthy) => {
      if (!isHealthy) {
        console.warn('Backend is not available. Please ensure the backend server is running on http://localhost:8080');
      } else {
        console.log('Backend connection successful!');
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <ErrorDisplay />
        <ProgressBar />
        <div className="flex-1">
          <AppContent />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
