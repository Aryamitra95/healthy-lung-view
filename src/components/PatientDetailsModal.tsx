
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, Upload, Download, User, Phone, Mail, MapPin, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onPatientUpdated?: (patient: Patient) => void;
}

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

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPatientUpdated
}) => {
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (patient) {
      setEditedPatient({ ...patient });
      setErrors({});
    }
  }, [patient]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedPatient?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editedPatient?.age || editedPatient.age < 0 || editedPatient.age > 150) {
      newErrors.age = 'Please enter a valid age (0-150)';
    }

    if (editedPatient?.email && !/\S+@\S+\.\S+/.test(editedPatient.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (editedPatient?.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(editedPatient.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!editedPatient || !validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/update-patient', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPatient)
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        onPatientUpdated?.(updatedPatient);
        toast({
          title: "Success",
          description: "Patient information updated successfully",
        });
        onClose();
      } else {
        throw new Error('Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editedPatient) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', editedPatient.patientId);

      const response = await fetch('/api/upload-patient-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const { imageUrl } = await response.json();
        const updatedImages = [...(editedPatient.images || []), imageUrl];
        setEditedPatient({ ...editedPatient, images: updatedImages });
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(`/api/download-patient-image?url=${encodeURIComponent(imageUrl)}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patient_${editedPatient?.patientId}_image_${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    if (!editedPatient) return;
    
    const currentSymptoms = editedPatient.symptoms || [];
    const updatedSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    
    setEditedPatient({ ...editedPatient, symptoms: updatedSymptoms });
  };

  const removeImage = (index: number) => {
    if (!editedPatient) return;
    const updatedImages = editedPatient.images?.filter((_, i) => i !== index) || [];
    setEditedPatient({ ...editedPatient, images: updatedImages });
  };

  if (!editedPatient) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Patient Details</h2>
                <p className="text-green-100">ID: {editedPatient.patientId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={editedPatient.name}
                    onChange={e => setEditedPatient({ ...editedPatient, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" /> Age *
                    </label>
                    <input
                      type="number"
                      value={editedPatient.age}
                      onChange={e => setEditedPatient({ ...editedPatient, age: Number(e.target.value) })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                      min="0"
                      max="150"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <select
                      value={editedPatient.sex || ''}
                      onChange={e => setEditedPatient({ ...editedPatient, sex: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" /> Email
                  </label>
                  <input
                    type="email"
                    value={editedPatient.email || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={editedPatient.phone || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" /> Address
                  </label>
                  <textarea
                    value={editedPatient.address || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Medical Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Symptoms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomsList.map(symptom => (
                      <label key={symptom} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedPatient.symptoms?.includes(symptom) || false}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                  <textarea
                    value={editedPatient.medicalHistory || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, medicalHistory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                    placeholder="Enter medical history"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <input
                    type="text"
                    value={editedPatient.allergies || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, allergies: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter known allergies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                  <textarea
                    value={editedPatient.medications || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, medications: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                    placeholder="Enter current medications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    value={editedPatient.emergencyContact || ''}
                    onChange={e => setEditedPatient({ ...editedPatient, emergencyContact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Name and phone number"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Patient Images</h3>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                    disabled={uploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              {editedPatient.images && editedPatient.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editedPatient.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Patient image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleImageDownload(imageUrl, index)}
                          className="bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeImage(index)}
                          className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Upload patient images to view them here</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PatientDetailsModal;
