import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { PatientService } from '@/services/patientService';

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

// Required symptoms mapping for the new schema
const symptomsMapping = {
  'Cough (more than three weeks)': 'coughMostThatThreeWeek',
  'Fever': 'fever',
  'Chest Pain': 'chestPain',
  'Shortness of Breath': 'shortOfBreath',
  'Sweating': 'sweating'
};

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

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image file size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      // Map symptoms to the required schema
      const mappedSymptoms: Record<string, boolean> = {};
      symptoms.forEach(symptom => {
        const mappedKey = symptomsMapping[symptom as keyof typeof symptomsMapping];
        if (mappedKey) {
          mappedSymptoms[mappedKey] = true;
        }
      });
      
      // Add form data
      formData.append('patientName', name);
      formData.append('age', age);
      formData.append('sex', sex);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('medicalHistory', medicalHistory);
      formData.append('allergies', allergies);
      formData.append('medications', medications);
      formData.append('emergencyContact', emergencyContact);
      
      // Add mapped symptoms
      Object.entries(mappedSymptoms).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add empty arrays/objects for required fields
      formData.append('longInProgressCn', JSON.stringify({}));
      formData.append('L1', JSON.stringify([]));
      
      // Send to backend using the service
      const result = await PatientService.createPatientWithImage(formData);
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
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      
      {/* Image Upload Section */}
      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-semibold border-b pb-2">Chest X-Ray Image</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Upload X-Ray Image (Optional)</label>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-md border border-green-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Supported formats: JPG, PNG, GIF. Maximum size: 10MB
            </p>
          </div>
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
