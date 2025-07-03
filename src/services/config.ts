export const awsConfig = { 
    region: process.env.VITE_AWS_REGION || 'eu-north-1', 
    credentials: { 
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '', 
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
};

export const tableNames = { 
    users: process.env.VITE_DYNAMODB_TABLE_NAME || 'users'
};