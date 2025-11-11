import { useState } from 'react';
import { Menu, X, Home, Plane, Map, ShoppingBag } from 'lucide-react';
import { useKioskStore } from '../store/kioskStore';
import logo from '../assets/image/logo.png';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentStep, reset, activePage, setActivePage } = useKioskStore();

  const menuItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: () => { 
        setActivePage(null);
        reset(); 
        setIsMenuOpen(false); 
      }
    },
    { 
      id: 'flight-details', 
      label: 'Flight Info', 
      icon: Plane, 
      action: () => { 
        setActivePage('flight-details');
        setIsMenuOpen(false); 
      } 
    },
    { 
      id: 'terminal-map', 
      label: 'Terminal Map', 
      icon: Map, 
      action: () => { 
        setActivePage('terminal-map');
        setIsMenuOpen(false); 
      } 
    },
    { 
      id: 'services', 
      label: 'Services', 
      icon: ShoppingBag, 
      action: () => { 
        setActivePage('services');
        setIsMenuOpen(false); 
      } 
    },
  ];

  // Determine if a menu item is active
  const isActive = (itemId: string) => {
    if (itemId === 'home') {
      return activePage === null;
    }
    return activePage === itemId;
  };


  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200/30 rounded-full blur-lg"></div>
              <img 
                src={logo} 
                alt="Airport Logo" 
                className="h-10 w-auto object-contain relative z-10"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">Airport Check-In</h1>
              <p className="text-xs text-gray-500">Self-Service Kiosk</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                    active
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md animate-slide-down max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    active
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

