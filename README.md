# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c82208e7-7377-4a31-bac4-9f464e5eafe5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c82208e7-7377-4a31-bac4-9f464e5eafe5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Nebius AI API (for medical report generation)

## Patient Management with Image Upload Feature

This application includes a comprehensive patient management system with X-ray image upload capabilities. The feature provides:

### Features:
- **Patient Registration**: Complete patient information capture with medical history
- **X-Ray Image Upload**: Secure upload of chest X-ray images to AWS S3
- **Symptom Tracking**: Detailed symptom checklist for respiratory conditions
- **Data Storage**: Patient records stored in DynamoDB with S3 image references
- **Image Management**: Public S3 URLs for easy image access and sharing

### Technical Implementation:
- **Backend**: Express.js server with multer for file uploads
- **Storage**: AWS S3 bucket (lungsXrays) with public read access
- **Database**: DynamoDB table (Patients) with comprehensive patient schema
- **Frontend**: React form with image preview and validation
- **File Handling**: Support for JPG, PNG, GIF up to 10MB

### DynamoDB Schema:
```json
{
  "PatientID": "uuid-string",
  "patientName": "John Doe",
  "age": 45,
  "sex": "male",
  "coughMostThatThreeWeek": true,
  "fever": false,
  "chestPain": false,
  "shortOfBreath": true,
  "sweating": false,
  "longInProgressCn": {},
  "L1": [],
  "imageUrl": "https://lungsXrays.s3.amazonaws.com/patient-images/uuid-file.jpg",
  "imageKey": "patient-images/uuid-file.jpg",
  "uploadTimestamp": "2025-07-05T07:02:00.000Z"
}
```

## Medical Report Generation Feature

This application includes an AI-powered medical report generator that creates comprehensive chest X-ray analysis reports. The feature provides:

### Features:
- **AI-Powered Analysis**: Uses the Nebius API with Llama-3_1-Nemotron-Ultra-253B-v1 model
- **Comprehensive Reports**: Generates detailed medical reports with three sections:
  - **Summary**: Professional medical summary of X-ray findings
  - **Cause**: Detailed explanation of potential causes and risk factors
  - **Suggested Actions**: Comprehensive treatment recommendations and next steps
- **Error Handling**: Clear error messages when API is unavailable or fails
- **Medical Accuracy**: Designed for healthcare professionals with appropriate clinical recommendations

### Setup:
1. Get your Nebius API key from [https://api.studio.nebius.com/](https://api.studio.nebius.com/)
2. Create a `.env` file in the project root with:
   ```
   VITE_NEBIUS_API_KEY=your_nebius_api_key_here
   VITE_AWS_REGION=eu-north-1
   VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id
   VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   S3_BUCKET_NAME=lungsXrays
   VITE_PATIENTS_TABLE=Patients
   PORT=5001
   ```
3. Install dependencies: `npm install`
4. Start the full development environment: `npm run dev:full`
5. The application will be available at `http://localhost:8080`

### Usage:
#### Patient Registration:
1. Navigate to the patient registration form
2. Fill in patient information (name, age, sex, contact details)
3. Upload a chest X-ray image (optional but recommended)
4. Select relevant symptoms from the checklist
5. Add medical history and current medications
6. Submit the form to create a patient record

#### Medical Report Generation:
1. Upload a chest X-ray image
2. Review the AI prediction results
3. Click "Generate Report" to create a comprehensive medical report
4. View the report in the tabbed interface (Summary, Cause, Suggested Actions)

### Important Notes:
- This is a medical AI tool and should be used as a supplementary diagnostic aid
- All reports should be reviewed by qualified healthcare professionals
- The system includes appropriate medical disclaimers and recommendations
- Clear error messages are shown when the API is unavailable

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c82208e7-7377-4a31-bac4-9f464e5eafe5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
