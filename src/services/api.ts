export interface HFSpaceResponse {
  word: string;
  healthy_score: number;
  tb_score: number;
  pneumonia_score: number;
}

export interface PredictionData {
  healthy: number;
  tuberculosis: number;
  pneumonia: number;
  prediction: string;
}

const HF_SPACE_URL = import.meta.env.VITE_HF_SPACE_URL;
const RETRY_LIMIT = 2;

export const uploadImageToHFSpace = async (
  file: File,
  retry = 0
): Promise<PredictionData> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${HF_SPACE_URL}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HF Space API error: ${response.status}`);
    }

    const data: HFSpaceResponse = await response.json();

    return {
      healthy: data.healthy_score,
      tuberculosis: data.tb_score,
      pneumonia: data.pneumonia_score,
      prediction: data.word,
    };
  } catch (error: any) {
    if (retry < RETRY_LIMIT) {
      // Exponential backoff
      await new Promise((res) => setTimeout(res, 1000 * (retry + 1)));
      return uploadImageToHFSpace(file, retry + 1);
    }
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}; 