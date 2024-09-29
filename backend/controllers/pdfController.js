const axios = require('axios');
const FormData = require('form-data');
const PDF = require('../models/PDFModel'); // PDF model
const User = require('../models/User'); // User model
const axiosRetry = require('axios-retry');

// Custom retry function
const axiosWithRetry = async (url, data, config, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await axios.post(url, data, config);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            if (error.response && error.response.status !== 500 && !axios.isNetworkError(error)) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Wait 1s, 2s, 3s
        }
    }
};

const chatWithPdf = async (req, res) => {
    try {
        console.log('Received request to chat with PDF.');

        const user = req.user;
        const { sourceId, message } = req.body;  // Expecting sourceId from the client

        if (!message || message.trim() === '') {
            console.log('Message content is missing.');
            return res.status(400).json({ message: 'Message content cannot be empty.' });
        }

        console.log('Finding PDF with sourceId:', sourceId);

        // Find the PDF by user and sourceId
        const pdf = await PDF.findOne({ sourceId, user: user._id });
        if (!pdf) {
            console.log('PDF not found for user.');
            return res.status(404).json({ message: 'PDF not found' });
        }

        console.log(`Found PDF, preparing chat request using sourceId: ${sourceId}`);

        const payload = {
            sourceId: sourceId,
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        };

        console.log('Preparing to send chat request to ChatPDF API with payload:', payload);

        try {
            const response = await axiosWithRetry(
                'https://api.chatpdf.com/v1/chats/message',
                payload,
                {
                    headers: {
                        'x-api-key': process.env.CHATPDF_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Received response from ChatPDF API:', response.data);
            const assistantReply = response.data.content;

            // Save user message and assistant reply to chat history
            pdf.chatHistory.push({ role: 'user', content: message });
            pdf.chatHistory.push({ role: 'assistant', content: assistantReply });
            await pdf.save();

            console.log('Chat history updated and saved to database.');

            res.status(200).json({ message: assistantReply });
        } catch (chatPdfError) {
            console.error('Error from ChatPDF API:', chatPdfError.message);
            console.error('Full error details:', chatPdfError.response ? chatPdfError.response.data : 'No response data');

            res.status(500).json({
                message: 'Error communicating with ChatPDF API',
                error: chatPdfError.message
            });
        }
    } catch (error) {
        console.error('Unexpected error in chatWithPdf function:', error.message);
        res.status(500).json({
            message: 'An unexpected error occurred',
            error: error.message
        });
    }
};


const getAllPdfs = async (req, res) => {
    try {
        const user = req.user;  // Get authenticated user from the middleware

        console.log('Fetching all PDFs for user:', user._id);

        // Find all PDFs associated with the user
        const pdfs = await PDF.find({ user: user._id });

        if (pdfs.length === 0) {
            return res.status(404).json({ message: 'No PDFs found for this user.' });
        }

        console.log(`Found ${pdfs.length} PDFs for user.`);

        // Return the list of PDFs
        res.status(200).json(pdfs);
    } catch (error) {
        console.error('Error fetching PDFs:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const uploadPdf = async (req, res) => {
    try {
        console.log('Received request to upload PDF.');

        const file = req.file;  // Get file from multer
        const user = req.user;  // Get authenticated user from the middleware

        if (!file) {
            console.log('No file uploaded.');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Log req.file to see what it contains
        console.log('File received:', file);

        // Create formData and use file.buffer to attach the file
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname); // Use file buffer

        console.log('Sending file to ChatPDF API...');

        // Send the file to ChatPDF API
        const response = await axios.post(
            'https://api.chatpdf.com/v1/sources/add-file',
            formData,
            {
                headers: {
                    'x-api-key': process.env.CHATPDF_API_KEY,
                    ...formData.getHeaders(),
                },
            }
        );

        console.log('Received response from ChatPDF API:', response.data);

        const sourceId = response.data.sourceId;

        // Save the PDF to the database, associating it with the user
        const newPdf = new PDF({
            sourceId,
            name: file.originalname,
            user: user._id,   // Reference the authenticated user
        });
        await newPdf.save();

        console.log('PDF saved to the database with sourceId:', sourceId);

        res.status(201).json({ sourceId, user: user.email, fileName: file.originalname });
    } catch (error) {
        console.error('Error uploading PDF:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



const deletePdf = async (req, res) => {
    try {
        const user = req.user;
        const pdfId = req.params.id;

        const pdf = await PDF.findOne({ _id: pdfId, user: user._id });

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found or you do not have permission to delete it.' });
        }

        await PDF.deleteOne({ _id: pdfId });

        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        console.error('Error deleting PDF:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};











module.exports = {
    uploadPdf,
    chatWithPdf,
    getAllPdfs,
    deletePdf,
};
