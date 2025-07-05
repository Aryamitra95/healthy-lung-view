import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { docClient } from '@/services/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const symptomsList = [
  'Cough (more than three weeks)',
  'Fever',
  'Sweating',
  'Smoking',
  'Chest Pain',
  'Shortness of Breath',
  'Weight Loss',
  'Night Sweats',
  'Fatigue',
  'Blood in Sputum'
];

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, onCancel }) => {
  // Basic Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Medical Info
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // UI State
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age || Number(age) < 0 || Number(age) > 150) newErrors.age = 'Valid age required';
    if (!sex) newErrors.sex = 'Sex is required';
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSuccess('');
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const patientId = uuidv4();
      const item = {
        PatientID: patientId,
        name,
        age: Number(age),
        sex,
        email,
        phone,
        address,
        symptoms,
        medicalHistory,
        allergies,
        medications,
        emergencyContact,
        createdAt: new Date().toISOString(),
      };
      const tableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';
      await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      setSuccess('Patient record created successfully!');
      // Reset form
      setName('');
      setAge('');
      setSex('');
      setEmail('');
      setPhone('');
      setAddress('');
      setSymptoms([]);
      setMedicalHistory('');
      setAllergies('');
      setMedications('');
      setEmergencyContact('');
      setErrors({});
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
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Create New Patient</h2>
      {/* Basic Information */}
      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-semibold border-b pb-2">Basic Information</h3>
        <div>
          <input
            className={`border rounded-md p-3 w-full text-lg ${errors.name ? 'border-red-500' : 'border-green-300'}`}
            placeholder="Full Name *"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div className="flex gap-4">
          <input
            className={`border rounded-md p-3 w-1/2 text-lg ${errors.age ? 'border-red-500' : 'border-green-300'}`}
            placeholder="Age *"
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            min={0}
            max={150}
          />
          <select
            className={`border rounded-md p-3 w-1/2 text-lg ${errors.sex ? 'border-red-500' : 'border-green-300'}`}
            value={sex}
            onChange={e => setSex(e.target.value)}
          >
            <option value="">Sex *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <input
            className={`border rounded-md p-3 w-full text-lg ${errors.email ? 'border-red-500' : 'border-green-300'}`}
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <input
            className={`border rounded-md p-3 w-full text-lg ${errors.phone ? 'border-red-500' : 'border-green-300'}`}
            placeholder="Phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <textarea
            className="border border-green-300 rounded-md p-3 w-full text-lg resize-none"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={2}
          />
        </div>
      </div>
      {/* Medical Information */}
      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-semibold border-b pb-2">Medical Information</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Symptoms</label>
          <div className="grid grid-cols-2 gap-2">
            {symptomsList.map(symptom => (
              <label key={symptom} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-green-100">
                <Checkbox
                  checked={symptoms.includes(symptom)}
                  onCheckedChange={() => handleSymptomToggle(symptom)}
                />
                <span className="text-green-900 text-base">{symptom}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <textarea
            className="border border-green-300 rounded-md p-3 w-full text-lg resize-none"
            placeholder="Medical History"
            value={medicalHistory}
            onChange={e => setMedicalHistory(e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <input
            className="border border-green-300 rounded-md p-3 w-full text-lg"
            placeholder="Allergies"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
          />
        </div>
        <div>
          <textarea
            className="border border-green-300 rounded-md p-3 w-full text-lg resize-none"
            placeholder="Current Medications"
            value={medications}
            onChange={e => setMedications(e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <input
            className="border border-green-300 rounded-md p-3 w-full text-lg"
            placeholder="Emergency Contact"
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
          />
        </div>
      </div>
      {/* Actions */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors"
      >
        {loading ? 'Submitting...' : 'Save Patient'}
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
