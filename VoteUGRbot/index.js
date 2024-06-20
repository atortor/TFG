const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// Configurar conexión a MySQL
const db = mysql.createConnection({
    host: 'monorail.proxy.rlwy.net',
    user: 'root',
    password: 'gKhlPukBfRDFWSwROHtdZyYHIaYkvbsL',
    port: 24506,
    database: 'railway'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw err;
    }
    console.log('Conexión a la base de datos establecida');
});

// Ejemplo de consulta
app.get('/ejemplo', (req, res) => {
    db.query('SELECT * FROM asignaturas_table', (err, result) => {
        if (err) {
            console.error('Error al ejecutar consulta:', err);
            res.status(500).json({ error: 'Error al ejecutar consulta' });
            return;
        }
        res.json(result);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
