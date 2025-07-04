import type { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const TableName = import.meta.env.VITE_PATIENTS_TABLE || 'Patients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter' });
  }

  try {
    // Scan the table and filter by name or PatientID containing the query string (case-insensitive)
    const command = new ScanCommand({ TableName });
    const data = await client.send(command);
    const results = (data.Items || []).filter((item: any) => {
      const name = item.name?.toLowerCase() || '';
      const id = item.PatientID?.toLowerCase() || '';
      const query = q.toLowerCase();
      return name.includes(query) || id.includes(query);
    });
    res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search patients' });
  }
} 