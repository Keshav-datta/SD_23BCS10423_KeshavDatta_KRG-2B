import { useLocation, Link } from 'react-router-dom';

export default function Confirmation() {
  const location = useLocation();
  const { event, seats, orderId, total } = location.state || {};

  if (!event || !orderId) {
    return (
      <div className="text-center py-32 w-full">
        <p className="text-slate-400 text-xl mb-4">No confirmation data found.</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">← Go Home</Link>
      </div>
    );
  }

  const shortOrderId = orderId.split('-')[0].toUpperCase();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-100">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Your tickets are secured. Check your email for confirmation
          </p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
          {/* Top Image Banner */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">🎬 Movie Ticket</span>
              <h2 className="text-white text-3xl font-extrabold">{event.title}</h2>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p className="font-extrabold text-slate-700">{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
              <p className="font-extrabold text-slate-700">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Venue</p>
              <p className="font-extrabold text-slate-700 text-xs truncate">{event.location}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
              <p className="font-extrabold text-indigo-600 font-mono">#TF-{shortOrderId}</p>
            </div>
          </div>

          {/* Perforation Line */}
          <div className="relative mx-4 border-t-2 border-dashed border-slate-200 my-2">
            <div className="absolute -left-8 -top-4 w-8 h-8 bg-indigo-50 rounded-full border-r border-slate-200"></div>
            <div className="absolute -right-8 -top-4 w-8 h-8 bg-indigo-50 rounded-full border-l border-slate-200"></div>
          </div>

          {/* Seats & Total Section */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Seats Booked ({seats?.length})</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {seats?.map(seat => (
                    <div key={seat.id} className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-center">
                      <p className="text-lg font-extrabold">{seat.seat_number}</p>
                      <p className="text-xs opacity-80">Standard</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Amount Paid</p>
                      <p className="text-3xl font-extrabold text-green-600">₹{total?.toFixed(0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600 font-bold uppercase">✅ Payment Confirmed</p>
                      <p className="text-xs text-slate-400 mt-1">{event.language} · {event.duration_mins} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-28 h-20 rounded-xl overflow-hidden mb-2"
                  style={{ background: 'repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 2px, transparent 2px, transparent 5px, #1e293b 5px, #1e293b 7px, transparent 7px, transparent 12px)' }}>
                </div>
                <p className="text-[10px] font-mono text-slate-400">{orderId.slice(0, 16)}...</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Scan at entry gate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
            📥 Download E-Ticket
          </button>
          <Link to="/" className="flex-1 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2">
            🏠 Book More Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
