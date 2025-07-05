import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
export const ddbDocClient = DynamoDBDocumentClient.from(client);
export const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME; 