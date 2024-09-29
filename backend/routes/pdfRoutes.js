const express = require("express");
const { uploadPdf, chatWithPdf, getAllPdfs, deletePdf } = require("../controllers/pdfController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const multer = require("multer");
const upload = multer();

// Route to upload a PDF
router.post("/upload", protect, upload.single("file"), uploadPdf);

// Route to chat with a PDF
router.post("/chat", protect, chatWithPdf);

router.get('/all', protect, getAllPdfs);
router.delete('/:id', protect, deletePdf);

module.exports = router;
