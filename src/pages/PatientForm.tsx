import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { docClient } from '@/services/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const symptomsList = [
  'Cough (more than three weeks)',
  'Fever',
  'Sweating',
  'Smoking',
  'Chest Pain',
  'Shortness of Breath',
];

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(symptomsList.map(s => [s, false])) as any
  );
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = (symptom: string) => {
    setSelected(prev => ({ ...prev, [symptom]: !prev[symptom] }));
  };

  const handleSubmit = async () => {
    setSuccess('');
    setError('');
    if (!name.trim() || !sex.trim() || !age.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const patientId = uuidv4();
      const symptoms = Object.keys(selected).filter(key => selected[key]);
      const item = {
        patientId,
        name,
        sex,
        age: Number(age),
        symptoms,
        createdAt: new Date().toISOString(),
      };
      const tableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';
      await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      setSuccess('Patient record created successfully!');
      setName('');
      setSex('');
      setAge('');
      setSelected(Object.fromEntries(symptomsList.map(s => [s, false])) as any);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to create patient record.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Create new Patient:</h2>
      <div className="flex flex-col gap-4 mb-6">
        <input
          className="border border-green-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="flex gap-4">
          <select
            className="border border-green-300 rounded-md p-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
            value={sex}
            onChange={e => setSex(e.target.value)}
          >
            <option value="">Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            className="border border-green-300 rounded-md p-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
            placeholder="Age"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            min={0}
          />
        </div>
      </div>
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {symptomsList.map(s => (
            <label key={s} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-green-100">
              <Checkbox
                checked={selected[s]}
                onCheckedChange={() => handleToggle(s)}
              />
              <span className="text-green-900 text-base">{s}</span>
            </label>
          ))}
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Symptoms'}
      </Button>
      {success && <div className="text-green-700 mt-4 text-center font-medium">{success}</div>}
      {error && <div className="text-red-600 mt-4 text-center font-medium">{error}</div>}
      {onCancel && (
        <div className="flex justify-end mt-6">
          <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </form>
  );
};

export default PatientForm; 