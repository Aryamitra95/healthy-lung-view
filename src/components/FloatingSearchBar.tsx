
import React, { useState, useRef, useEffect } from 'react';
import { Search, User } from 'lucide-react';

interface Patient {
  patientId: string;
  name: string;
  age: number;
  sex?: string;
  symptoms?: string[];
  email?: string;
  phone?: string;
  address?: string;
  images?: string[];
}

interface FloatingSearchBarProps {
  onSelect: (patient: Patient) => void;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-patients?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowDropdown(true);
        } else {
          console.error('Failed to search patients:', response.statusText);
          setResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error('Error searching patients:', err);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4" ref={searchRef}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
          <input
            type="text"
            className="w-full rounded-full border-2 border-green-300 bg-white pl-12 pr-6 py-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-lg transition-all"
            placeholder="Search patients by name, ID, or phone..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
          />
        </div>

        {showDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-green-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-10">
            {loading && (
              <div className="px-6 py-4 text-green-600 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                Searching patients...
              </div>
            )}
            
            {!loading && results.length > 0 && (
              <>
                {results.map(patient => (
                  <div
                    key={patient.patientId}
                    className="px-6 py-4 cursor-pointer hover:bg-green-50 border-b border-green-100 last:border-b-0 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setQuery('');
                      setResults([]);
                      onSelect(patient);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-green-800 text-lg">{patient.name}</h3>
                            <p className="text-gray-600 text-sm">ID: {patient.patientId}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>Age: {patient.age}</p>
                            {patient.sex && <p>{patient.sex}</p>}
                          </div>
                        </div>
                        {patient.phone && (
                          <p className="text-green-600 text-sm mt-1">📱 {patient.phone}</p>
                        )}
                        {patient.symptoms && patient.symptoms.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {patient.symptoms.slice(0, 3).map(symptom => (
                                <span key={symptom} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                  {symptom}
                                </span>
                              ))}
                              {patient.symptoms.length > 3 && (
                                <span className="text-green-600 text-xs">+{patient.symptoms.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {!loading && results.length === 0 && query.trim() && (
              <div className="px-6 py-8 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No patients found</p>
                <p className="text-sm">Try searching with a different name or ID</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSearchBar;
