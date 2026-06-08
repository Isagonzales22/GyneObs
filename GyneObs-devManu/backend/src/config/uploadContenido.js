const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Asegurar que el directorio existe
const uploadDir = 'uploads/contenidos_educativos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    cb(null, fileName);
  }
});

// Filtrar imágenes y documentos
const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp|svg/;
  const allowedDocuments = /pdf|msword|vnd\.openxmlformats-officedocument\.|spreadsheet|text\/plain|application\/vnd\.ms-|application\/vnd\.oasis\.opendocument/;
  
  const extname = file.originalname.toLowerCase();
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/i;
  const isValidExt = allowedExtensions.test(extname);
  
  const isImage = allowedImages.test(file.mimetype);
  const isDocument = allowedDocuments.test(file.mimetype) || /^text\//.test(file.mimetype);
  
  if ((isImage || isDocument) && isValidExt) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (PNG, JPG, GIF, WebP, SVG) y documentos (PDF, Word, PowerPoint, Excel, TXT)'));
  }
};

// Configuración de multer
const uploadContenido = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite para documentos
  },
  fileFilter: fileFilter
});

module.exports = uploadContenido;
