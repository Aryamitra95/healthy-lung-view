export interface HFSpaceResponse {

  word: string;
  healthy_score: string;
  tb_score: string;
  pneumonia_score: string;
  imageUrl: string;
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
): Promise<HFSpaceResponse> => {
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

    const word = response.headers.get('word') || '';
    const healthy_score = parseFloat(response.headers.get('healthy_score') || '0');
    const tb_score = parseFloat(response.headers.get('tb_score') || '0');
    const pneumonia_score = parseFloat(response.headers.get('pneumonia_score') || '0');
  
    // Get the image blob and convert to URL
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return {
      word,
    healthy_score,
    tb_score,
    pneumonia_score,
    imageUrl,
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