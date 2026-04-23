import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000';
const SERVICE_FEE = 60; // ₹60 service fee

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/events/${id}`).then(r => r.json()),
      fetch(`${API}/events/${id}/seats`).then(r => r.json()),
    ]).then(([ev, se]) => {
      setEvent(ev);
      setSeats(se);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const handleProceed = () => {
    if (!user) { navigate('/auth'); return; }
    if (selectedSeats.length === 0) return;
    navigate('/booking', { state: { event, seats: selectedSeats } });
  };

  const ticketSubtotal = selectedSeats.length * (event?.ticket_price || 250);
  const total = ticketSubtotal + (selectedSeats.length > 0 ? SERVICE_FEE : 0);

  const rows = seats.length > 0
    ? [...new Set(seats.map(s => s.seat_number.charAt(0)))].sort()
    : [];

  if (loading) return (
    <div className="flex justify-center items-center py-32 w-full">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!event) return (
    <div className="text-center py-32 w-full">
      <p className="text-2xl text-slate-400">Movie not found.</p>
      <Link to="/" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">← Go Home</Link>
    </div>
  );

  const availableCount = seats.filter(s => !s.is_booked).length;
  const bookedCount = seats.filter(s => s.is_booked).length;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-24 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-indigo-600 font-semibold transition-colors">Home</Link>
        <span>›</span>
        <Link to="/events" className="hover:text-indigo-600 font-semibold transition-colors">Events</Link>
        <span>›</span>
        <span className="text-slate-700 font-bold truncate">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">

          {/* Movie Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row gap-0">
              <div className="md:w-56 h-72 md:h-auto flex-shrink-0">
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'; }}
                />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">🎬 Now Showing</span>
                    {event.genre && <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{event.genre}</span>}
                    {event.language && <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{event.language}</span>}
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{event.title}</h1>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{event.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Date & Time</p>
                      <p className="font-bold text-slate-700 text-xs">{new Date(event.date).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric',year:'numeric'})} · {new Date(event.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Venue</p>
                      <p className="font-bold text-slate-700 text-xs leading-tight">{event.location}</p>
                    </div>
                  </div>
                  {event.duration_mins && (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <span className="text-xl">⏱️</span>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Duration</p>
                        <p className="font-bold text-slate-700">{event.duration_mins} min</p>
                      </div>
                    </div>
                  )}
                  {event.rating && (
                    <div className="flex items-center gap-3 bg-yellow-50 rounded-xl p-3">
                      <span className="text-xl">⭐</span>
                      <div>
                        <p className="text-xs text-yellow-600 font-bold uppercase">IMDb Rating</p>
                        <p className="font-bold text-slate-700">{event.rating}/10</p>
                      </div>
                    </div>
                  )}
                </div>
                {event.cast_info && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cast</p>
                    <p className="text-sm text-slate-600 font-semibold">{event.cast_info}</p>
                  </div>
                )}
                {/* Seat Availability Badge */}
                <div className="mt-3 flex gap-3">
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-100">
                    ✅ {availableCount} seats available
                  </span>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100">
                    🔴 {bookedCount} seats booked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-slate-800">🪑 Select Your Seats</h2>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-emerald-500 inline-block"></span>Available</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-indigo-600 inline-block"></span>Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-red-400 inline-block"></span>Booked</span>
              </div>
            </div>

            {/* Screen */}
            <div className="mb-8">
              <div className="w-4/5 mx-auto h-2 bg-gradient-to-r from-transparent via-indigo-300 to-transparent rounded-full mb-2"></div>
              <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-400">— SCREEN —</p>
            </div>

            {/* Seats */}
            <div className="space-y-3 overflow-x-auto pb-2">
              {rows.map(row => {
                const rowSeats = seats.filter(s => s.seat_number.charAt(0) === row)
                  .sort((a, b) => parseInt(a.seat_number.slice(1)) - parseInt(b.seat_number.slice(1)));
                return (
                  <div key={row} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-extrabold text-slate-400 text-center flex-shrink-0">{row}</span>
                    <div className="flex gap-2 flex-wrap">
                      {rowSeats.map(seat => {
                        const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            disabled={seat.is_booked}
                            title={seat.is_booked ? 'Already booked' : `Seat ${seat.seat_number} — ₹${event.ticket_price?.toFixed(0)}`}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150
                              ${seat.is_booked
                                ? 'bg-red-400 text-white cursor-not-allowed opacity-70'
                                : isSelected
                                ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-300 ring-2 ring-indigo-300'
                                : 'bg-emerald-500 text-white hover:scale-110 hover:shadow-md hover:shadow-emerald-300'
                              }`}
                          >
                            {seat.seat_number.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-6 text-center">
              💡 Click a green seat to select. Click again to deselect. You can pick multiple seats.
            </p>
          </div>
        </div>

        {/* RIGHT - Booking Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Your Selection</p>
                <h3 className="text-xl font-extrabold">Booking Summary</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Selected Seats ({selectedSeats.length})
                  </p>
                  {selectedSeats.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No seats selected yet...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(s => (
                        <span key={s.id} onClick={() => toggleSeat(s)} className="bg-indigo-50 text-indigo-700 text-sm font-bold px-3 py-1 rounded-lg border border-indigo-200 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" title="Click to remove">
                          {s.seat_number} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{selectedSeats.length} × ₹{event.ticket_price?.toFixed(0)}</span>
                    <span className="font-semibold">₹{ticketSubtotal.toFixed(0)}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Service Fee</span>
                      <span className="font-semibold">₹{SERVICE_FEE}</span>
                    </div>
                  )}
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600">₹{total.toFixed(0)}</span>
                </div>

                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 font-semibold">
                    ⚠️ <Link to="/auth" className="text-indigo-600 underline font-bold">Sign in</Link> to book tickets.
                  </div>
                )}

                <button
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {selectedSeats.length === 0
                    ? 'Select seats to continue'
                    : `Proceed to Checkout →  ₹${total.toFixed(0)}`}
                </button>
                <p className="text-xs text-center text-slate-400">🔒 Secure · Instant Confirmation · Free Cancellation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
