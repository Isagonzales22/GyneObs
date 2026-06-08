const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const uploadContenido = require('../config/uploadContenido');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { verificarToken } = require('../middlewares/authMiddleware');

// Configurar Cloudinary con las credenciales de las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Endpoint para subir foto de perfil (público para permitir registro y actualización)
router.post('/perfil', (req, res) => {
  // Usar multer para manejar la subida local temporal
  const uploadMiddleware = upload.single('foto');
  
  uploadMiddleware(req, res, async (err) => {
    // Manejar errores de multer
    if (err) {
      console.error('Error en multer:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'El archivo es demasiado grande. Máximo 5MB' 
        });
      }
      return res.status(400).json({ 
        message: err.message || 'Error al subir el archivo' 
      });
    }
    
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se subió ningún archivo' 
      });
    }
    
    try {
      // Subir archivo local a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'perfiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' } // Recortar y centrar en la cara
        ]
      });

      // Eliminar el archivo local temporal
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.log('Foto subida a Cloudinary exitosamente:', result.secure_url);
      
      res.json({
        success: true,
        fotoUrl: result.secure_url,
        message: 'Foto subida exitosamente'
      });
    } catch (error) {
      console.error('Error al subir a Cloudinary:', error);
      
      // Intentar eliminar el archivo local temporal de todas formas en caso de error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Error al eliminar archivo local temporal:', unlinkErr);
        }
      }
      
      res.status(500).json({ 
        message: 'Error al procesar la foto en Cloudinary',
        error: error.message
      });
    }
  });
});

router.post('/contenido', verificarToken, (req, res) => {
  const uploadMiddleware = uploadContenido.single('archivo');

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error('Error en multer:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 10MB' });
      }
      return res.status(400).json({ message: err.message || 'Error al subir el archivo' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'contenidos_educativos',
        resource_type: 'auto',
      });

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.json({
        success: true,
        archivoUrl: result.secure_url,
        message: 'Archivo subido correctamente',
      });
    } catch (error) {
      console.error('Error al subir a Cloudinary:', error);
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error('Error al eliminar archivo local temporal:', unlinkErr);
        }
      }
      res.status(500).json({
        message: 'Error al procesar el archivo en Cloudinary',
        error: error.message,
      });
    }
  });
});

// Endpoint para eliminar foto (deprecado para Cloudinary, respondemos éxito)
router.delete('/perfil/:filename', verificarToken, (req, res) => {
  res.json({ success: true, message: 'La foto se gestiona directamente en Cloudinary' });
});

module.exports = router;