const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    sourceId: { type: String, required: true },  // Source ID from ChatPDF API
    name: { type: String, required: true },      // PDF file name
    uploadedAt: { type: Date, default: Date.now },
    chatHistory: [
        {
            role: { type: String, required: true },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const PDF = mongoose.model('PDF', pdfSchema);

module.exports = PDF;
