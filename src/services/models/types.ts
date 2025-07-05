export interface PatientData {
  PatientID: string;
  patientName: string;
  age: number;
  sex: string;
  coughMostThatThreeWeek: boolean;
  fever: boolean;
  chestPain: boolean;
  shortOfBreath: boolean;
  sweating: boolean;
  longInProgressCn: Record<string, any>;
  L1: any[];
  imageUrl: string;
  imageKey: string;
  uploadTimestamp: string;
  // Additional fields from existing form
  email?: string;
  phone?: string;
  address?: string;
  symptoms?: string[];
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientFormData {
  patientName: string;
  age: string;
  sex: string;
  email: string;
  phone: string;
  address: string;
  symptoms: string[];
  medicalHistory: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  image?: File;
}
