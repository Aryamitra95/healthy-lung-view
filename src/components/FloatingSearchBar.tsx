
import React, { useState } from 'react';
import { FiSearch, FiAlertTriangle } from 'react-icons/fi';

interface FloatingSearchBarProps {
  onPatientSelect: (patientId: string) => void;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ onPatientSelect }) => {
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
    <div className="w-full max-w-[600px] mx-auto flex flex-col items-center px-2">
      <div className="relative w-full flex items-center">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 opacity-80 text-xl pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search patients by name or userId"
          className="w-full pl-12 pr-4 py-4 border-2 border-green-600 rounded-lg outline-none text-lg transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:border-green-700 bg-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-3 px-5 py-3 bg-green-600 text-white rounded-lg font-semibold text-base flex items-center transition-all duration-200 hover:bg-green-700 focus:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Search
          {loading && (
            <span className="ml-2 inline-block w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></span>
          )}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 mt-3 font-medium text-base transition-opacity duration-200">
          <FiAlertTriangle className="text-xl" />
          {error}
        </div>
      )}
      <div className="w-full mt-5 flex flex-col gap-3">
        {results.length > 0 && (
          <ul>
            {results.map((patient, idx) => {
              const id = patient.PatientID || patient.userId;
              return (
                <li
                  key={id || idx}
                  className="cursor-pointer text-green-600 hover:underline bg-white rounded-xl shadow-md p-5 border border-green-100 transition-all duration-200 mb-3"
                  onClick={() => onPatientSelect(id)}
                >
                  <strong className="text-green-700 text-lg">
                    {patient.name || patient.userId}
                  </strong>
                  <div className="text-gray-700 mt-1">
                    {patient.PatientID
                      ? `ID: ${patient.PatientID}`
                      : patient.userId
                      ? `UserID: ${patient.userId}`
                      : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FloatingSearchBar;
