import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { docClient } from '@/services/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, Stethoscope, User as UserIcon } from 'lucide-react';

const symptomsList = [
  { key: 'coughMoreThanThreeWeek', label: 'Cough (more than three weeks)' },
  { key: 'fever', label: 'Fever' },
  { key: 'sweating', label: 'Sweating' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'chestPain', label: 'Chest Pain' },
  { key: 'shortnessOfBreathe', label: 'Shortness of Breath' },
] as const;

type SymptomKey = typeof symptomsList[number]['key'];

const username = (() => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.userID || 'Doctor';
})();

const handleLogout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const RegistrarForm: React.FC = () => {
  const [selected, setSelected] = useState<Record<SymptomKey, boolean>>(
    Object.fromEntries(symptomsList.map(s => [s.key, false])) as any
  );
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = (key: SymptomKey) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
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
      const symptoms = Object.keys(selected).filter(key => selected[key as SymptomKey]);
      const item = {
        patientId,
        name,
        sex,
        age: Number(age),
        symptoms,
        createdAt: new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: 'Patients', Item: item }));
      setSuccess('Patient record created successfully!');
      setName('');
      setSex('');
      setAge('');
      setSelected(Object.fromEntries(symptomsList.map(s => [s.key, false])) as any);
    } catch (err) {
      setError('Failed to create patient record.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b-4 border-green-500 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Stethoscope className="w-8 h-8 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-700 tracking-tight">Lung Lens</span>
        </div>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:border-green-700 font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </Button>
      </header>

      {/* Welcome Section */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-2xl bg-gradient-to-r from-green-400 to-green-600 border-2 border-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-green-200">
            <span className="text-3xl font-bold text-green-600">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">Welcome, {username}</div>
            <div className="text-white/90 text-lg">Ready to analyze chest X-rays with AI-powered diagnostics</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl shadow-lg border border-green-200 bg-green-50 p-8 mt-8 mb-8">
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
                <label key={s.key} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-green-100">
                  <Checkbox
                    checked={selected[s.key]}
                    onCheckedChange={() => handleToggle(s.key)}
                  />
                  <span className="text-green-900 text-base">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Symptoms'}
          </Button>
          {success && <div className="text-green-700 mt-4 text-center font-medium">{success}</div>}
          {error && <div className="text-red-600 mt-4 text-center font-medium">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default RegistrarForm; 