import React, { useState, useRef, useEffect } from 'react';
import { docClient } from '@/services/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

interface Patient {
  patientId: string;
  name: string;
  age: number;
  sex?: string;
  symptoms?: string[];
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
        const tableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';
        const scanResult = await docClient.send(
          new ScanCommand({
            TableName: tableName,
            FilterExpression: 'contains(#name, :q)',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: { ':q': query },
            Limit: 10,
          })
        );
        setResults((scanResult.Items as Patient[]) || []);
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    // Cleanup on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-green-300 bg-white px-6 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
          placeholder="Search patients by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-green-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
            {results.map(patient => (
              <div
                key={patient.patientId}
                className="px-6 py-3 cursor-pointer hover:bg-green-50 flex justify-between items-center"
                onClick={() => {
                  setShowDropdown(false);
                  setQuery('');
                  setResults([]);
                  onSelect(patient);
                }}
              >
                <span className="font-medium text-green-800">{patient.name}</span>
                <span className="text-gray-500 text-sm ml-4">Age: {patient.age}</span>
              </div>
            ))}
          </div>
        )}
        {showDropdown && !loading && results.length === 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-green-200 rounded-xl shadow-xl px-6 py-3 text-gray-500">
            No patients found.
          </div>
        )}
        {loading && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-green-200 rounded-xl shadow-xl px-6 py-3 text-green-500">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSearchBar; 