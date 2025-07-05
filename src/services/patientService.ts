import { PatientData, PatientFormData } from './models/types';

const API_BASE_URL = '/api';

export class PatientService {
  static async createPatientWithImage(formData: FormData): Promise<PatientData> {
    const response = await fetch(`${API_BASE_URL}/create-patient-with-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create patient');
    }

    return response.json();
  }

  static async createPatient(patientData: PatientFormData): Promise<PatientData> {
    const response = await fetch(`${API_BASE_URL}/create-patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create patient');
    }

    return response.json();
  }

  static async searchPatients(query: string): Promise<PatientData[]> {
    const response = await fetch(`${API_BASE_URL}/search-patients?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search patients');
    }

    return response.json();
  }

  static async getPatientById(patientId: string): Promise<PatientData> {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Patient not found');
      }
      throw new Error('Failed to fetch patient');
    }

    return response.json();
  }

  static async updatePatient(patientData: PatientData): Promise<PatientData> {
    const response = await fetch(`${API_BASE_URL}/update-patient`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update patient');
    }

    return response.json();
  }
} 