import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// AWS DynamoDB configuration
const dynamoClient = new DynamoDBClient({
    region: process.env.VITE_AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// AWS S3 configuration
const s3Client = new S3Client({
    region: process.env.VITE_AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
});

// Table names configuration
const tableNames = {
    users: process.env.VITE_DYNAMODB_TABLE_NAME || 'users',
    patients: process.env.VITE_PATIENTS_TABLE || 'Patients'
};

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'lung-lens-images';

const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});

// Enhanced search patients endpoint
app.get('/api/search-patients', async (req, res) => {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
        return res.json([]);
    }

    try {
        const scanResult = await docClient.send(
            new ScanCommand({
                TableName: tableNames.patients,
                FilterExpression: 'contains(#name, :q) OR contains(patientId, :q) OR contains(phone, :q)',
                ExpressionAttributeNames: { '#name': 'name' },
                ExpressionAttributeValues: { ':q': q },
                Limit: 20,
            })
        );
        
        res.json(scanResult.Items || []);
    } catch (err) {
        console.error('Error searching patients:', err);
        res.status(500).json({ error: 'Failed to search patients' });
    }
});

// Get patient by ID endpoint
app.get('/api/patient/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await docClient.send(
            new GetCommand({
                TableName: tableNames.patients,
                Key: { patientId: id }
            })
        );
        
        if (result.Item) {
            res.json(result.Item);
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// Update patient endpoint
app.put('/api/update-patient', async (req, res) => {
    const patientData = req.body;
    
    if (!patientData.patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    try {
        // Add updated timestamp
        const updatedPatient = {
            ...patientData,
            updatedAt: new Date().toISOString()
        };

        await docClient.send(
            new PutCommand({
                TableName: tableNames.patients,
                Item: updatedPatient
            })
        );
        
        res.json(updatedPatient);
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// Upload patient image endpoint
app.post('/api/upload-patient-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { patientId } = req.body;
        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID is required' });
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `patients/${patientId}/${uuidv4()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
            Bucket: S3_BUCKET,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'private'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Generate signed URL for accessing the image
        const signedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: fileName
            }),
            { expiresIn: 3600 * 24 * 7 } // 7 days
        );

        res.json({ imageUrl: signedUrl, s3Key: fileName });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Download patient image endpoint
app.get('/api/download-patient-image', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Extract S3 key from signed URL or use direct key
        let s3Key;
        if (url.includes('amazonaws.com')) {
            const urlParts = url.split('/');
            s3Key = urlParts.slice(urlParts.indexOf(S3_BUCKET) + 1).join('/').split('?')[0];
        } else {
            s3Key = url;
        }

        const getObjectParams = {
            Bucket: S3_BUCKET,
            Key: s3Key
        };

        const command = new GetObjectCommand(getObjectParams);
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

        // Fetch the image and stream it back
        const response = await fetch(signedUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image from S3');
        }

        const imageBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="patient_image.jpg"');
        res.send(Buffer.from(imageBuffer));
        
    } catch (err) {
        console.error('Error downloading image:', err);
        res.status(500).json({ error: 'Failed to download image' });
    }
});

// Create new patient endpoint
app.post('/api/create-patient', async (req, res) => {
    try {
        const patientData = req.body;
        const patientId = uuidv4();
        
        const newPatient = {
            ...patientData,
            patientId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await docClient.send(
            new PutCommand({
                TableName: tableNames.patients,
                Item: newPatient
            })
        );
        
        res.json(newPatient);
    } catch (err) {
        console.error('Error creating patient:', err);
        res.status(500).json({ error: 'Failed to create patient' });
    }
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
