import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import BookingPage from './pages/BookingPage';
import Confirmation from './pages/Confirmation';
import Auth from './pages/Auth';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f8f9ff]" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
          <Navbar />
          <main className="flex-grow flex flex-col items-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </main>
          <footer className="w-full border-t border-slate-200 py-6 bg-white">
            <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
              <div>
                <span className="font-bold text-slate-700 text-base">🎬 TicketFlow</span>
                <p className="text-xs mt-1">India's most trusted movie & event ticketing platform.</p>
              </div>
              <div className="flex gap-6">
                <a href="/events" className="hover:text-indigo-600 transition-colors">Events</a>
                <a href="/my-bookings" className="hover:text-indigo-600 transition-colors">My Bookings</a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
