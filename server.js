import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});

app.post('/api/generate-report', async (req, res) => {
    const predictionData = req.body;

    const messages = [
        {
            role: "system",
            content: `You are an expert AI medical report generator specializing in chest X-ray analysis.
You will receive prediction data from a lung disease classification model and generate comprehensive medical reports.
The prediction data includes confidence scores for healthy, tuberculosis, and pneumonia classifications, along with the primary predicted diagnosis.

Your task is to generate detailed medical reports with three main sections:
1. SUMMARY: A professional medical summary of the X-ray findings based on the prediction probabilities
2. CAUSE: Detailed explanation of the potential causes and risk factors for the diagnosed condition
3. SUGGESTED_ACTIONS: Comprehensive treatment recommendations and next steps for patient care

Respond ONLY with a valid JSON object, with no markdown, no code block, and no extra text. The JSON object must have exactly these keys: "summary", "cause", and "suggestedActions". If you do not know a value, return an empty string for that key. Do not include any explanations or formatting outside the JSON object. Do not return a single string or any other format.`
        },
        {
            role: "user",
            content: `Generate a comprehensive medical report for a chest X-ray analysis with the following AI prediction results:\n\nPrediction Confidence Scores:\n- Healthy: ${predictionData.healthy}%\n- Tuberculosis: ${predictionData.tuberculosis}%\n- Pneumonia: ${predictionData.pneumonia}%\n\nPrimary AI Diagnosis: ${predictionData.prediction}\n\nPlease provide a detailed medical report including clinical correlation recommendations, potential differential diagnoses, and specific treatment protocols based on these findings.`
        }
    ];

    try {
        const response = await client.chat.completions.create({
            model: "meta-llama/Llama-3.3-70B-Instruct",
            max_tokens: 2048,
            temperature: 0.6,
            top_p: 0.9,
            top_k: 50,
            messages
        });

        const content = response.choices[0].message.content;
        console.log('================ RAW MODEL OUTPUT START ================');
        console.log(content);
        console.log('================ RAW MODEL OUTPUT END ==================');
        let cleaned = content.trim();
        // Remove markdown code block if present
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
        }
        // Extract first {...} JSON object if present
        const match = cleaned.match(/{[\s\S]*}/);
        if (match) {
            cleaned = match[0];
        }
        let report;
        try {
            report = JSON.parse(cleaned);
            // Ensure all keys are present
            report.summary = report.summary || '';
            report.cause = report.cause || '';
            report.suggestedActions = report.suggestedActions || '';
        } catch {
            report = { summary: content, cause: '', suggestedActions: '' };
        }
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 