# PDFAI: AI-Powered PDF Chat Application

PDFAI is a React-based web application that allows users to upload PDF documents and chat with an AI about the content of those documents. It provides an intuitive interface for managing PDFs and engaging in conversations based on their content.

## Features

- **PDF Management**: Upload, view, and delete PDF documents.
- **AI-Powered Chat**: Interact with an AI to ask questions about the uploaded PDFs.
- **Responsive Design**: A sidebar for PDF management that can be toggled on smaller screens.
- **Real-time Updates**: Chat messages appear in real-time with a scrollable chat interface.
- **User Authentication**: Secure login and logout functionality.

## Technologies Used

- React
- Framer Motion for animations
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/pdfai.git
   cd pdfai
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or if you're using yarn:
   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Replace the URL with your actual backend API URL.

4. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

1. **Login**: Use your credentials to log in to the application.

2. **Upload PDF**: Click the "Upload PDF" button in the sidebar to upload a new PDF document.

3. **Select PDF**: Click on a PDF in the sidebar to select it for chatting.

4. **Chat**: Once a PDF is selected, you can start asking questions about its content in the chat input at the bottom of the screen.

5. **Delete PDF**: To remove a PDF, click the trash icon next to its name in the sidebar.

6. **Logout**: Click the "Logout" button in the sidebar to end your session.

## Component Structure

The main component `PdfaiUploadChat` contains the following key elements:

- Sidebar for PDF management
- Chat interface
- PDF upload functionality
- AI interaction logic

## API Integration

The component interacts with a backend API for the following operations:
- Fetching all PDFs
- Uploading new PDFs
- Deleting PDFs
- Sending chat messages and receiving AI responses

Ensure your backend API supports these operations and is correctly configured to work with this frontend.

## Styling

The application uses Tailwind CSS for styling. Custom styles can be added or modified in the component's JSX classes.

## Error Handling

Basic error handling is implemented for API calls. Error messages are logged to the console and, in some cases, displayed to the user via alerts.

## Future Improvements

- Implement more robust error handling and user feedback
- Add pagination for large numbers of PDFs
- Implement a search functionality for PDFs
- Add support for different types of document formats

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License![chat](https://github.com/user-attachments/assets/0a0801bb-f357-48aa-bec7-e85d9593ed79)


This project is licensed under the MIT License.
![login](https://github.com/user-attachments/assets/5e600cbd-24ac-4fe8-b42f-24e6f029ce26)

![sign_up](https://github.com/user-attachments/assets/0db5c1b9-ad50-443d-91cd-17c1a775e474)


