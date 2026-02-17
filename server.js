const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Base de datos simple en un archivo JSON
const DB_FILE = 'reservas.json';

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener todas las reservas (para verificar disponibilidad)
app.get('/api/reservas', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data);
});

// Crear una nueva reserva
app.post('/api/reservas', (req, res) => {
    const { name, email, subject, day, times, comments } = req.body;
    
    if (!name || !email || !subject || !day || !times || !Array.isArray(times) || times.length === 0) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    if (times.length > 3) {
        return res.status(400).json({ error: 'No puedes reservar más de 3 horas seguidas.' });
    }

    const reservas = JSON.parse(fs.readFileSync(DB_FILE));
    
    // Verificar cupo para cada hora seleccionada
    for (const time of times) {
        const alumnosEnTurno = reservas.filter(r => r.day === day && r.time === time).length;
        if (alumnosEnTurno >= 6) {
            return res.status(400).json({ error: `El turno de las ${time} ya está completo.` });
        }
    }

    const nuevasReservas = times.map(time => ({
        id: Date.now() + Math.random(),
        name,
        email,
        subject,
        day,
        time,
        comments,
        createdAt: new Date().toISOString()
    }));

    reservas.push(...nuevasReservas);
    fs.writeFileSync(DB_FILE, JSON.stringify(reservas, null, 2));

    res.status(201).json({ message: 'Reserva confirmada con éxito.', reservas: nuevasReservas });
});

app.listen(PORT, () => {
    console.log(`Servidor de reservas corriendo en http://localhost:${PORT}`);
});
