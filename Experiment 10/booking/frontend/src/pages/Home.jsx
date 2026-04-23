import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:8000';

const MOVIE_IMAGES = [
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=80',
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Suggestion states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async (q = '', loc = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('query', q);
      if (loc) params.append('location', loc);
      const res = await fetch(`${API}/events/search?${params}`);
      setEvents(await res.json());
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${API}/events/search?query=${query}`);
        const data = await res.json();
        setSuggestions(data.slice(0, 5)); // show top 5
      } catch (err) {
        setSuggestions([]);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setShowSuggestions(false);
    fetchEvents(query, location); 
  };

  return (
    <div className="w-full pb-16">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-24 text-white">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">🎬 Book Tickets Instantly</span>
            <h1 className="text-5xl font-extrabold leading-tight mb-4">
              Find Your Next<br />
              <span className="text-yellow-300">Unforgettable</span> Movie.
            </h1>
            <p className="text-white/80 text-lg mb-10">
              Seamlessly discover and book tickets for blockbusters, concerts, and live events — all in one place.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-3xl">
            <div className="flex flex-1 items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl relative">
              <span className="text-indigo-400 text-lg">🔍</span>
              <input
                className="bg-transparent flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none font-semibold"
                placeholder="Movie title, genre..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                autoComplete="off"
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-64 overflow-y-auto overflow-x-hidden">
                   {suggestions.map((s, idx) => (
                      <div 
                        key={s.id} 
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent onBlur
                          navigate(`/event/${s.id}`);
                        }} 
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex gap-3 items-center border-b border-slate-50 last:border-0 transition-colors"
                      >
                         <img 
                            src={s.image_url || MOVIE_IMAGES[idx % MOVIE_IMAGES.length]} 
                            className="w-10 h-14 object-cover rounded-md flex-shrink-0" 
                            alt={s.title}
                            onError={(e) => { e.target.src = MOVIE_IMAGES[idx % MOVIE_IMAGES.length]; }}
                         />
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {s.genre?.split('/')[0]} • {s.location}
                            </p>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
              <span className="text-indigo-400 text-lg">📍</span>
              <input
                className="bg-transparent flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none font-semibold"
                placeholder="Cinema, city..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-lg">
              Search →
            </button>
          </form>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-[1280px] mx-auto px-6 mt-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Now Showing</h2>
            <p className="text-slate-400 mt-1 text-sm">{events.length} movie{events.length !== 1 ? 's' : ''} available · All prices in ₹ INR</p>
          </div>
          <div className="flex gap-2">
            <Link to="/events" className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all">View All Events →</Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-xl font-semibold">No movies found.</p>
            <button onClick={() => { setQuery(''); setLocation(''); fetchEvents(); }} className="mt-4 text-indigo-600 font-semibold hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, idx) => {
              const imgSrc = event.image_url || MOVIE_IMAGES[idx % MOVIE_IMAGES.length];
              const available = '—';
              return (
                <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden">
                    <img src={imgSrc} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = MOVIE_IMAGES[idx % MOVIE_IMAGES.length]; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <span className="text-indigo-700 text-xs font-extrabold uppercase tracking-wider">{event.genre?.split('/')[0].trim() || 'Cinema'}</span>
                    </div>
                    {event.rating && (
                      <div className="absolute top-3 right-3 bg-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="text-xs font-extrabold text-yellow-900">⭐ {event.rating}</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-xs font-semibold bg-black/40 px-2 py-1 rounded-full">
                        {event.language} • {event.duration_mins}min
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">{event.title}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <span>📅</span>
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-4 truncate">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-semibold">From</p>
                        <p className="text-xl font-extrabold text-indigo-600">₹{event.ticket_price?.toFixed(0)}</p>
                      </div>
                      <Link
                        to={`/event/${event.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200"
                      >
                        Book Now →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
