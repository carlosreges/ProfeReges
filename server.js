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

// La base queda fuera de la carpeta pública para no exponer datos personales.
const DATA_DIR = path.join(__dirname, '..', 'profereges-data');
const DB_FILE = path.join(DATA_DIR, 'reservas.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Exponer únicamente la disponibilidad, nunca los datos de las reservas.
app.get('/api/reservas', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const availability = data.reduce((counts, reservation) => {
        const key = `${reservation.day}:${reservation.time}`;
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {});
    res.json({ availability });
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

    res.status(201).json({ message: 'Reserva confirmada con éxito.', times });
});

app.listen(PORT, () => {
    console.log(`Servidor de reservas corriendo en http://localhost:${PORT}`);
});
