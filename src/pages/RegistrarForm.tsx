import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { docClient } from '@/services/dynamodb';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, Stethoscope, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingSearchBar from '../components/FloatingSearchBar';
import { Dialog } from '@headlessui/react';
import PatientForm from './PatientForm';

const symptomsList = [
  'Cough (more than three weeks)',
  'Fever',
  'Sweating',
  'Smoking',
  'Chest Pain',
  'Shortness of Breath',
];

type SymptomKey = typeof symptomsList[number];

interface RegistrarFormProps {
  userId: string;
  onLogout: () => void;
}

const RegistrarForm: React.FC<RegistrarFormProps> = ({ userId, onLogout }) => {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(symptomsList.map(s => [s, false])) as any
  );
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchName = async () => {
      setProfileLoading(true);
      setProfileError('');
      const trimmedUserId = userId.trim();
      console.log('Fetching user profile:', { userID: trimmedUserId, table: import.meta.env.VITE_DYNAMODB_TABLE_NAME });
      try {
        const result = await docClient.send(new GetCommand({ TableName: import.meta.env.VITE_DYNAMODB_TABLE_NAME, Key: { userID: trimmedUserId } }));
        if (!result.Item || !result.Item.userName) {
          setProfileError('User not found.');
          setTimeout(() => navigate('/login', { replace: true }), 1500);
          return;
        }
        setName(result.Item.userName);
      } catch (err) {
        setProfileError('Failed to fetch user profile.');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } finally {
        setProfileLoading(false);
      }
    };
    if (userId) fetchName();
  }, [userId, navigate]);

  const handleToggle = (key: SymptomKey) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setEditPatient({ ...patient });
    setModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditPatient((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSymptomToggle = (symptom) => {
    setEditPatient((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...(prev.symptoms || []), symptom],
    }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const patientsTableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';
      await docClient.send(
        new PutCommand({ TableName: patientsTableName, Item: editPatient })
      );
      setEditSuccess('Patient updated successfully!');
      setSelectedPatient(editPatient);
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err) {
      setEditError('Failed to update patient.');
    } finally {
      setEditLoading(false);
    }
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
      const patientsTableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';
      const PatientID = uuidv4();
      const symptoms = Object.keys(selected).filter(key => selected[key as string]);
      const item = {
        PatientID,
        name,
        sex,
        age: Number(age),
        symptoms,
        createdAt: new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: patientsTableName, Item: item }));
      setSuccess('Patient record created successfully!');
      setName('');
      setSex('');
      setAge('');
      setSelected(Object.fromEntries(symptomsList.map(s => [s, false])) as any);
    } catch (err) {
      setError('Failed to create patient record.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <FloatingSearchBar onPatientSelect={() => {}} />
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-lg z-10">
            <Dialog.Title className="text-xl font-bold mb-4">Edit Patient</Dialog.Title>
            {editPatient && (
              <form onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <div className="mb-2">
                  <label className="block font-medium">Name:</label>
                  <input className="w-full border rounded p-2" value={editPatient.name} onChange={e => handleEditChange('name', e.target.value)} />
                </div>
                <div className="mb-2">
                  <label className="block font-medium">Age:</label>
                  <input className="w-full border rounded p-2" type="number" value={editPatient.age} onChange={e => handleEditChange('age', Number(e.target.value))} />
                </div>
                <div className="mb-2">
                  <label className="block font-medium ">Sex:</label>
                  <select className="w-full border rounded p-2" value={editPatient.sex || ''} onChange={e => handleEditChange('sex', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block font-medium">Symptoms:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomsList.map(symptom => (
                      <label key={symptom} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editPatient.symptoms?.includes(symptom) || false}
                          onChange={() => handleEditSymptomToggle(symptom)}
                        />
                        <span>{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {editError && <div className="text-red-600 mt-2">{editError}</div>}
                {editSuccess && <div className="text-green-600 mt-2">{editSuccess}</div>}
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Dialog>
      {/* Create New Patient Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-3xl z-10">
            <Dialog.Title className="text-2xl font-bold mb-4">Create New Patient</Dialog.Title>
            <PatientForm onCancel={() => setCreateModalOpen(false)} />
          </div>
        </div>
      </Dialog>
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b-4 border-green-500 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Stethoscope className="w-8 h-8 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-700 tracking-tight">Lung Lens</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:border-green-700 font-semibold"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </Button>
          <Button
            className="bg-green-600 text-white font-semibold px-6 py-2 rounded shadow hover:bg-green-700"
            onClick={() => setCreateModalOpen(true)}
          >
            + Create New Patient
          </Button>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="flex justify-center items-center my-8 w-full">
        <div className="w-full max-w-2xl bg-gradient-to-r from-green-400 to-green-600 border-2 border-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-green-200">
            <span className="text-3xl font-bold text-green-600">
              {profileLoading ? '...' : name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {profileLoading ? 'Loading...' : `Welcome, ${name}`}
            </div>
            <div className="text-white/90 text-lg">
              {profileLoading ? 'Fetching your profile...' : 'Ready to analyze chest X-rays with AI-powered diagnostics'}
            </div>
            {profileError && <p className="text-red-500 mt-2">{profileError}</p>}
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
              onChange={e => setName(e.target.value)}
            />
            <div className="flex gap-4">
              <select
                className="border border-green-300 rounded-md p-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                value={sex}
                onChange={e => setSex(e.target.value)}
              >
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
                    checked={selected[s as string]}
                    onCheckedChange={() => handleToggle(s as SymptomKey)}
                  />
                  <span className="text-green-900 text-base">{s}</span>
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