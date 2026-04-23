import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:8000';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&w=700&q=80',
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('All');

  // Suggestion states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Comedy', 'Hindi', 'Telugu'];

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

  const filtered = activeGenre === 'All'
    ? events
    : events.filter(e => e.genre?.toLowerCase().includes(activeGenre.toLowerCase()) || e.language?.toLowerCase().includes(activeGenre.toLowerCase()));

  return (
    <div className="w-full pb-16 pt-24">
      {/* Page Header */}
      <div className="max-w-[1280px] mx-auto px-6 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">🎭 All Events</h1>
        <p className="text-slate-400">Browse all upcoming movies and live events</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-[1280px] mx-auto px-6 mb-8">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-col md:flex-row gap-2 relative">
          <div className="flex flex-1 items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl relative">
            <span className="text-indigo-400">🔍</span>
            <input className="bg-transparent flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none font-semibold"
              placeholder="Search by title, genre..." 
              value={query} 
              onChange={e => {
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
                          src={s.image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]} 
                          className="w-10 h-14 object-cover rounded-md flex-shrink-0" 
                          alt={s.title}
                          onError={(e) => { e.target.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]; }}
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
          <div className="flex flex-1 items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
            <span className="text-indigo-400">📍</span>
            <input className="bg-transparent flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none font-semibold"
              placeholder="City, cinema..." value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2.5 rounded-xl transition-all">
            Search
          </button>
        </form>
      </div>

      {/* Genre Filters */}
      <div className="max-w-[1280px] mx-auto px-6 mb-8 flex flex-wrap gap-2">
        {genres.map(g => (
          <button key={g} onClick={() => setActiveGenre(g)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              activeGenre === g ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
            }`}>
            {g}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-400 self-center">{filtered.length} events</span>
      </div>

      {/* Grid */}
      <div className="max-w-[1280px] mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-3">🎭</div>
            <p className="text-lg font-semibold">No events found for this filter.</p>
            <button onClick={() => { setActiveGenre('All'); fetchEvents(); }} className="mt-3 text-indigo-600 font-semibold hover:underline">Show All</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((event, idx) => {
              const img = event.image_url || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
              return (
                <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-44 overflow-hidden">
                    <img src={img} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={e => { e.target.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <span className="text-indigo-700 text-[11px] font-extrabold uppercase">{event.genre?.split('/')[0].trim()}</span>
                    </div>
                    {event.rating && (
                      <div className="absolute top-2 right-2 bg-yellow-400 px-2 py-0.5 rounded-full">
                        <span className="text-[11px] font-extrabold text-yellow-900">⭐ {event.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-extrabold text-slate-800 mb-1 truncate group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <span>📅</span> {new Date(event.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                    </p>
                    <p className="text-xs text-slate-400 mb-3 truncate flex items-center gap-1">
                      <span>📍</span> {event.location}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <p className="text-lg font-extrabold text-indigo-600">₹{event.ticket_price?.toFixed(0)}</p>
                      <Link to={`/event/${event.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                        Book Now
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
