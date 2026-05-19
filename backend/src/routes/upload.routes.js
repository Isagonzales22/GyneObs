const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');

// Servir archivos estáticos
router.use('/perfiles', express.static('uploads/perfiles'));

// Endpoint para subir foto de perfil
router.post('/perfil', (req, res) => {
  // Usar multer para manejar la subida
  const uploadMiddleware = upload.single('foto');
  
  uploadMiddleware(req, res, (err) => {
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
      // Construir URL pública de la imagen
      const fotoUrl = `${req.protocol}://${req.get('host')}/api/uploads/perfiles/${req.file.filename}`;
      
      console.log('Foto subida exitosamente:', fotoUrl);
      
      res.json({
        success: true,
        fotoUrl: fotoUrl,
        message: 'Foto subida exitosamente'
      });
    } catch (error) {
      console.error('Error al procesar la foto:', error);
      res.status(500).json({ 
        message: 'Error al procesar la foto' 
      });
    }
  });
});

// Endpoint para eliminar foto
router.delete('/perfil/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../uploads/perfiles', filename);
  
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Error al eliminar archivo:', err);
      return res.status(500).json({ message: 'Error al eliminar la foto' });
    }
    res.json({ success: true, message: 'Foto eliminada exitosamente' });
  });
});

module.exports = router;