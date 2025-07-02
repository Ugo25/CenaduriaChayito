// server.js

const express = require('express');
const cors = require('cors');           // ← importar CORS después de express
const app = express();                  // ← inicializar app aquí
const port = 3000;

// Middlewares
app.use(cors());                        // ← usar CORS después de definir "app"
app.use(express.json());               // ← necesario para JSON en body

// Ruta POST
app.post('/api/generar-factura', async (req, res) => {
  console.log('Solicitud recibida');
    res.json({ mensaje: 'Factura generada' });

});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' })); // Para permitir PDF en base64

// Ruta para generar factura y subir PDF
app.post('/api/generar-factura', async (req, res) => {
  console.log('Recibiendo solicitud de factura...');
  
  try {
    if (!req.body?.datos || !req.body?.pdf) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const { datos, pdf } = req.body;
    console.log('Procesando factura para:', datos.correo);

    const matches = pdf.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Formato PDF base64 inválido');
    }

    const pdfBuffer = Buffer.from(matches[2], 'base64');

    const form = new FormData();
    form.append('file', pdfBuffer, `factura_${datos.folio}.pdf`);

    const config = {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000
    };

    console.log('Subiendo PDF a file.io...');
    const fileIoResponse = await axios.post('https://file.io', form, config);

    if (!fileIoResponse.data?.success) {
      console.error('Error de file.io:', fileIoResponse.data);
      throw new Error(fileIoResponse.data?.message || 'Error en file.io');
    }

    console.log('PDF subido exitosamente:', fileIoResponse.data.link);

    res.json({
      success: true,
      downloadUrl: fileIoResponse.data.link,
      expires: fileIoResponse.data.expires
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
