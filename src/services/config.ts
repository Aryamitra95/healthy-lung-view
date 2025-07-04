export const awsConfig = { 
    region: import.meta.env.VITE_AWS_REGION || 'eu-north-1', 
    credentials: { 
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '', 
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
};

export const tableNames = { 
    users: import.meta.env.VITE_DYNAMODB_TABLE_NAME || 'users',
    patients: import.meta.env.VITE_PATIENTS_TABLE || 'Patients'
};