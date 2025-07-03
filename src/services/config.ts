export const awsConfig = { 
    region: process.env.REACT_APP_AWS_REGION || 'eu-north-1', 
    credentials: { 
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '', 
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
    }
};

export const tableNames = { 
    users: process.env.REACT_APP_DYNAMODB_TABLE_NAME || 'Users'
};