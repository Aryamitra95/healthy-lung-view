import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateMedicalReport, PredictionData } from '@/services/medicalReportService';

const symptomsList = [
  { key: 'coughMoreThanThreeWeek', label: 'Cough (more than three weeks)' },
  { key: 'fever', label: 'Fever' },
  { key: 'sweating', label: 'Sweating' },
  { key: 'chestPain', label: 'Chest Pain' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'shortnessOfBreathe', label: 'Shortness of Breath' },
] as const;

type SymptomKey = typeof symptomsList[number]['key'];

const RegistrarForm: React.FC = () => {
  const [selected, setSelected] = useState<Record<SymptomKey, boolean>>(
    Object.fromEntries(symptomsList.map(s => [s.key, false])) as any
  );

  const handleToggle = (key: SymptomKey) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    // Construct minimal PredictionData payload
    const predictionData: PredictionData = {
      healthy: 0,
      tuberculosis: 0,
      pneumonia: 0,
      prediction: 'tuberculosis', // placeholder
      // @ts-ignore
      symptoms: selected,
    };
    const report = await generateMedicalReport(predictionData);
    console.log(report);
    // TODO: display report or send confirmation
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Registrar Symptom Form</h1>
      {symptomsList.map(s => (
        <label key={s.key} className="flex items-center mb-2">
          <Checkbox
            checked={selected[s.key]}
            onCheckedChange={() => handleToggle(s.key)}
          />
          <span className="ml-2">{s.label}</span>
        </label>
      ))}
      <Button onClick={handleSubmit}>Submit Symptoms</Button>
    </div>
  );
};

export default RegistrarForm; 