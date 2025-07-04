
import React, { useState } from 'react';

const FloatingSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: check if query looks like a userId (customize as needed)
  const isUserId = (q: string) => q.length > 0 && !q.match(/\s/);

  const handleSearch = async () => {
    setError('');
    setResults([]);
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a search term.');
      return;
    }
    setLoading(true);
    try {
      if (isUserId(trimmed)) {
        // Try userId endpoint first
        const res = await fetch(`/api/users/${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const user = await res.json();
          setResults([user]);
        } else if (res.status === 404) {
          // Fallback to name search if not found
          const res2 = await fetch(`/api/search-patients?q=${encodeURIComponent(trimmed)}`);
          if (res2.ok) {
            const data = await res2.json();
            if (!data || data.length === 0) {
              setError('No patients found.');
            } else {
              setResults(data);
            }
          } else {
            setError('Search failed.');
          }
        } else {
          setError('Search failed.');
        }
      } else {
        // Name search
        const res = await fetch(`/api/search-patients?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (!data || data.length === 0) {
            setError('No patients found.');
          } else {
            setResults(data);
          }
        } else {
          setError('Search failed.');
        }
      }
    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ position: 'relative', width: 400, margin: '0 auto' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="Search patients by name or userId"
        style={{ width: '100%', padding: '8px', fontSize: '16px' }}
      />
      <button onClick={handleSearch} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {results.length > 0 && (
        <ul style={{ marginTop: 8, background: '#fff', border: '1px solid #ccc', borderRadius: 4 }}>
          {results.map((patient, idx) => (
            <li key={patient.PatientID || patient.userId || idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <strong>{patient.name || patient.userId}</strong> {patient.PatientID ? `(ID: ${patient.PatientID})` : patient.userId ? `(UserID: ${patient.userId})` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FloatingSearchBar;
