import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`${API}/booking/user/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
          // Group bookings by order_id
          const grouped = data.reduce((acc, curr) => {
            if (!acc[curr.order_id]) {
              acc[curr.order_id] = {
                order_id: curr.order_id,
                event: curr.event,
                status: curr.status,
                created_at: curr.created_at,
                seats: []
              };
            }
            acc[curr.order_id].seats.push(curr.seat);
            return acc;
          }, {});
          setBookings(Object.values(grouped));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="w-full pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Please Sign In</h1>
        <p className="text-slate-400 mb-6">You need to be logged in to view your bookings.</p>
        <Link to="/auth" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all">
          Sign In / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-24 pb-16 max-w-[1280px] mx-auto px-6">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">🎟️ My Bookings</h1>
      <p className="text-slate-400 mb-8">Hello, <strong className="text-indigo-600">{user.name}</strong>! Here are your booked tickets.</p>
      
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎬</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">No bookings yet</h2>
          <p className="text-slate-500 mb-8 text-lg">Your ticket history will appear here after you book your first event.</p>
          <Link to="/events" className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Browse Upcoming Events →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map(order => (
            <div key={order.order_id} className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col md:flex-row">
              <img
                src={order.event.image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80'}
                alt={order.event.title}
                className="w-full md:w-40 h-48 md:h-auto object-cover flex-shrink-0"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80'; }}
              />
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {order.event.genre?.split('/')[0].trim() || 'Movie'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${order.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-1">{order.event.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                    <span>📅</span> {new Date(order.event.date).toLocaleDateString('en-IN', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})} · {new Date(order.event.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 truncate flex items-center gap-1">
                    <span>📍</span> {order.event.location}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seats ({order.seats.length})</p>
                      <div className="flex gap-1 flex-wrap">
                        {order.seats.map(s => (
                          <span key={s.id} className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md border border-slate-200">
                            {s.seat_number}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-mono text-xs font-bold text-indigo-600">#{order.order_id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
