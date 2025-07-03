import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from "./config"; 

// Create DynamoDB client
const client = new DynamoDBClient(awsConfig);

// Create Document client for easier operations
const docClient = DynamoDBDocumentClient.from(client);

export { client, docClient };