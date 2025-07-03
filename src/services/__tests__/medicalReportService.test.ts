import { generateMedicalReport } from '../medicalReportService';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn()
  }))
}));

describe('Medical Report Service', () => {
  const mockPredictionData = {
    healthy: 85,
    tuberculosis: 10,
    pneumonia: 5,
    prediction: 'Healthy'
  };

  const mockTuberculosisData = {
    healthy: 5,
    tuberculosis: 85,
    pneumonia: 10,
    prediction: 'Tuberculosis'
  };

  const mockPneumoniaData = {
    healthy: 10,
    tuberculosis: 5,
    pneumonia: 85,
    prediction: 'Pneumonia'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Set a mock API key for tests that need it
    (import.meta.env as any).VITE_NEBIUS_API_KEY = 'test-api-key';
  });

  test('should generate fallback report for healthy prediction', async () => {
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('cause');
    expect(report).toHaveProperty('suggestedActions');
    
    expect(report.summary).toContain('85%');
    expect(report.summary).toContain('normal findings');
    expect(report.cause).toContain('Normal chest X-ray');
    expect(report.suggestedActions).toContain('Correlate findings');
  });

  test('should generate fallback report for tuberculosis prediction', async () => {
    const report = await generateMedicalReport(mockTuberculosisData);
    
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('cause');
    expect(report).toHaveProperty('suggestedActions');
    
    expect(report.summary).toContain('85%');
    expect(report.summary).toContain('tuberculosis');
    expect(report.cause).toContain('Mycobacterium tuberculosis');
    expect(report.suggestedActions).toContain('ISOLATE PATIENT');
  });

  test('should generate fallback report for pneumonia prediction', async () => {
    const report = await generateMedicalReport(mockPneumoniaData);
    
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('cause');
    expect(report).toHaveProperty('suggestedActions');
    
    expect(report.summary).toContain('85%');
    expect(report.summary).toContain('pneumonia');
    expect(report.cause).toContain('Bacterial infections');
    expect(report.suggestedActions).toContain('Clinical correlation');
  });

  test('should return null when API key is not configured', async () => {
    // Remove API key to simulate missing configuration
    delete (import.meta.env as any).VITE_NEBIUS_API_KEY;
    
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).toBeNull();
  });

  test('should return null when API request fails', async () => {
    const axios = require('axios');
    const mockPost = jest.fn().mockRejectedValue(new Error('API Error'));
    axios.create.mockReturnValue({ post: mockPost });
    
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).toBeNull();
    expect(mockPost).toHaveBeenCalled();
  });

  test('should return null when API response parsing fails', async () => {
    const axios = require('axios');
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      }
    });
    axios.create.mockReturnValue({ post: mockPost });
    
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).toBeNull();
    expect(mockPost).toHaveBeenCalled();
  });

  test('should return valid report when API succeeds', async () => {
    const axios = require('axios');
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'Test summary',
              cause: 'Test cause',
              suggestedActions: 'Test actions'
            })
          }
        }]
      }
    });
    axios.create.mockReturnValue({ post: mockPost });
    
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).not.toBeNull();
    expect(report).toHaveProperty('summary', 'Test summary');
    expect(report).toHaveProperty('cause', 'Test cause');
    expect(report).toHaveProperty('suggestedActions', 'Test actions');
    expect(mockPost).toHaveBeenCalled();
  });

  test('should return null when API response has missing fields', async () => {
    const axios = require('axios');
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'Test summary'
              // Missing cause and suggestedActions
            })
          }
        }]
      }
    });
    axios.create.mockReturnValue({ post: mockPost });
    
    const report = await generateMedicalReport(mockPredictionData);
    
    expect(report).toBeNull();
    expect(mockPost).toHaveBeenCalled();
  });
}); 