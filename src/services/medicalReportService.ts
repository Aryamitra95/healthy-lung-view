import axios from 'axios';

export interface SymptomData {
  coughMoreThanThreeWeek: boolean;
  fever: boolean;
  sweating: boolean;
  chestPain: boolean;
  smoking: boolean;
  shortnessOfBreathe: boolean;
}

export interface PredictionData {
  healthy: number;
  tuberculosis: number;
  pneumonia: number;
  prediction: string;
  symptoms?: SymptomData;
}

export interface ReportData {
  summary: string;
  cause: string;
  suggestedActions: string;
}

// Configure the Nebius API client
const createNebiusClient = () => {
  const apiKey = import.meta.env.VITE_NEBIUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEBIUS_API_KEY environment variable is not set');
  }

  return axios.create({
    baseURL: 'https://api.studio.nebius.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
};

export const generateMedicalReport = async (predictionData: PredictionData): Promise<ReportData | null> => {
  try {
    const response = await fetch('http://localhost:5001/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...predictionData, symptoms: predictionData.symptoms })
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.summary || !data.cause || !data.suggestedActions) return null;
    return data;
  } catch (error) {
    console.error('Error generating medical report:', error);
    return null;
  }
};

// Fallback report generator for when API is unavailable
const generateFallbackReport = (predictionData: PredictionData): ReportData => {
  const primaryDiagnosis = predictionData.prediction.toLowerCase();
  
  if (primaryDiagnosis === 'healthy') {
    return {
      summary: `Based on the chest X-ray analysis, the AI model has identified a high probability (${predictionData.healthy}%) of normal findings. The imaging shows clear lung fields with normal cardiac silhouette and no evidence of significant pathology.

Key findings include:
• Clear lung fields bilaterally
• Normal cardiac silhouette
• No evidence of consolidation or infiltrates
• Normal mediastinal contours

This analysis suggests normal chest X-ray findings, though clinical correlation with patient symptoms is always recommended.`,
      
      cause: `Normal chest X-ray findings typically indicate:

• Absence of significant pulmonary pathology
• No evidence of infection, inflammation, or structural abnormalities
• Normal respiratory function (based on imaging alone)

However, it's important to note that:
• Normal X-rays don't rule out all respiratory conditions
• Clinical symptoms should always be considered
• Some conditions may not be visible on standard chest X-rays
• Follow-up may be needed based on clinical presentation`,
      
      suggestedActions: `Recommended Actions:
1. Correlate findings with patient symptoms and clinical presentation
2. If symptoms persist despite normal X-ray, consider additional imaging (CT scan)
3. Review patient history for risk factors
4. Consider pulmonary function tests if respiratory symptoms are present

Patient Management:
• Reassure patient about normal findings
• Continue monitoring if symptoms persist
• Schedule follow-up as clinically indicated
• Provide appropriate discharge instructions

Follow-up:
• Clinical reassessment if symptoms worsen
• Consider specialist referral if symptoms persist
• Maintain routine health monitoring`
    };
  } else if (primaryDiagnosis === 'tuberculosis') {
    return {
      summary: `Based on the chest X-ray analysis, the AI model has identified a high probability (${predictionData.tuberculosis}%) of tuberculosis. The imaging shows characteristic patterns consistent with mycobacterial infection affecting the pulmonary parenchyma.

Key findings include:
• Upper lobe infiltrates or cavities
• Possible mediastinal lymphadenopathy
• Signs of chronic inflammatory changes
• Potential calcifications

This analysis requires immediate clinical correlation and confirmatory testing for definitive diagnosis.`,
      
      cause: `Tuberculosis is caused by:

Primary Cause:
• Mycobacterium tuberculosis infection
• Airborne transmission from infected individuals
• Reactivation of latent infection

Risk Factors:
• Close contact with TB patients
• Immunocompromised status (HIV, diabetes, immunosuppressive therapy)
• Crowded living conditions
• Malnutrition
• Age (very young or elderly)
• Substance abuse

The radiological patterns observed suggest active pulmonary tuberculosis, requiring immediate isolation and treatment.`,
      
      suggestedActions: `Immediate Actions:
1. ISOLATE PATIENT immediately (airborne precautions)
2. Notify public health authorities (mandatory reporting)
3. Collect sputum samples for AFB smear and culture
4. Perform tuberculin skin test or interferon-gamma release assay
5. Screen close contacts

Treatment Protocol:
• Initiate four-drug therapy (RIPE regimen)
• Directly observed therapy (DOT) recommended
• Monitor for drug resistance
• Regular follow-up chest X-rays

Patient Management:
• Strict isolation until sputum is negative
• Education about transmission prevention
• Monitoring for treatment side effects
• Nutritional support

Follow-up:
• Weekly sputum monitoring initially
• Monthly clinical assessment
• Chest X-ray at 2 months and completion
• Contact tracing and screening`
    };
  } else {
    // Pneumonia
    return {
      summary: `Based on the chest X-ray analysis, the AI model has identified a high probability (${predictionData.pneumonia}%) of pneumonia. The imaging shows characteristic patterns consistent with inflammatory lung disease affecting the pulmonary parenchyma.

Key findings include:
• Increased opacity in lung fields
• Possible consolidation patterns
• Signs of inflammatory response
• Potential pleural effusion

This analysis should be correlated with clinical symptoms and physical examination findings for comprehensive patient assessment.`,
      
      cause: `Pneumonia is typically caused by:

Primary Causes:
• Bacterial infections (most common: Streptococcus pneumoniae)
• Viral infections (influenza, respiratory syncytial virus)
• Fungal infections (in immunocompromised patients)
• Aspiration of foreign material

Risk Factors:
• Age (very young or elderly)
• Compromised immune system
• Chronic lung diseases
• Recent respiratory tract infection
• Smoking or alcohol abuse

The radiological patterns observed suggest an infectious etiology, though clinical correlation is essential for definitive diagnosis.`,
      
      suggestedActions: `Immediate Actions:
1. Clinical correlation with patient symptoms (fever, cough, dyspnea)
2. Laboratory investigations (CBC, CRP, procalcitonin)
3. Sputum culture and sensitivity testing
4. Blood cultures if systemically unwell

Treatment Considerations:
• Empirical antibiotic therapy based on local guidelines
• Supportive care (oxygen therapy if hypoxemic)
• Monitor for complications
• Follow-up imaging in 48-72 hours if not improving

Patient Management:
• Assess severity using CURB-65 or PSI scores
• Consider hospitalization criteria
• Ensure adequate hydration and rest
• Patient education regarding medication compliance

Follow-up:
• Clinical reassessment in 48-72 hours
• Repeat chest X-ray if symptoms persist or worsen
• Complete antibiotic course as prescribed
• Pneumonia vaccination discussion post-recovery`
    };
  }
}; 