import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000';
const SERVICE_FEE = 60; // ₹60

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, seats } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });

  if (!event || !seats || seats.length === 0) {
    return (
      <div className="text-center py-32 w-full">
        <p className="text-slate-400 text-xl">No booking details found.</p>
        <Link to="/" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">← Go Home</Link>
      </div>
    );
  }

  const ticketPrice = event.ticket_price || 250;
  const subtotal = seats.length * ticketPrice;
  const total = subtotal + SERVICE_FEE;

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Create booking
      const bookingRes = await fetch(`${API}/booking/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id || 1,
          event_id: event.id,
          seat_ids: seats.map(s => s.id),
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.detail || 'Booking failed. Please try again.');

      // Step 2: Process payment
      const paymentRes = await fetch(`${API}/payment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: bookingData.order_id, amount: total }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.detail || 'Payment failed. Please try again.');

      navigate('/confirmation', { state: { event, seats, orderId: bookingData.order_id, total } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-24 pb-16">
      <Link to={`/event/${event.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm mb-6 transition-colors">
        ← Back to Seat Selection
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Review & Pay</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-extrabold text-slate-700">🎬 Order Summary</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <img
                src={event.image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80'}
                alt={event.title}
                className="w-full sm:w-36 h-44 object-cover rounded-xl flex-shrink-0"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80'; }}
              />
              <div className="flex-grow">
                {event.genre && <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block">{event.genre}</span>}
                <h3 className="text-xl font-extrabold text-slate-800 mb-3">{event.title}</h3>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <p>📅 {new Date(event.date).toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})} at {new Date(event.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                  <p>📍 {event.location}</p>
                  {event.duration_mins && <p>⏱️ {event.duration_mins} minutes · {event.language}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-extrabold text-slate-700">🪑 Selected Seats ({seats.length})</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {seats.map(seat => (
                  <div key={seat.id} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {seat.seat_number}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Standard</p>
                      <p className="font-bold text-slate-700">₹{ticketPrice.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-700">💳 Payment Details</h2>
              <span className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full border border-green-200">🔒 Demo Mode</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cardholder Name</label>
                <input value={cardForm.name} onChange={e => setCardForm({...cardForm, name: e.target.value})}
                  placeholder="Rahul Sharma" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Card Number</label>
                <input value={cardForm.number} onChange={e => setCardForm({...cardForm, number: e.target.value})}
                  placeholder="4111 1111 1111 1111" maxLength={19} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 font-mono tracking-wider" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Expiry (MM/YY)</label>
                  <input value={cardForm.expiry} onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                    placeholder="12/26" maxLength={5} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">CVV</label>
                  <input value={cardForm.cvv} onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                    placeholder="•••" maxLength={4} type="password" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-semibold">
                ℹ️ This is a <strong>demo</strong> — no real money is charged. Enter any values and click Pay Now.
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-semibold flex items-start gap-2">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}
        </div>

        {/* RIGHT - Price Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Price Breakdown</p>
              <h3 className="text-xl font-extrabold">Order Total</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>{seats.length} × Ticket @ ₹{ticketPrice.toFixed(0)}</span>
                <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Service Fee</span>
                <span className="font-semibold">₹{SERVICE_FEE}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-800">Total Payable</span>
                <span className="text-2xl font-extrabold text-indigo-600">₹{total.toFixed(0)}</span>
              </div>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2 text-sm">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : `Pay ₹${total.toFixed(0)} Now →`}
              </button>
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">🔒 256-bit SSL Encrypted</p>
                <p className="text-xs text-slate-400">Seats held for 10 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
