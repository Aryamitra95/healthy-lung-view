// If this is a Next.js API route, the import is correct. If not, replace with Express types.
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, USERS_TABLE_NAME } from '@/lib/dynamodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' });
  }

  try {
    const command = new GetCommand({
      TableName: USERS_TABLE_NAME,
      Key: { userId },
    });
    const { Item } = await ddbDocClient.send(command);
    if (!Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(Item);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 