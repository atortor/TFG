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

// Endpoint para manejar solicitudes de Dialogflow
app.post('/webhook', (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    console.log('Parameters received:', parameters);
    
    if (intent === 'InscribirAsignaturaInformaticaIntent') {
        const person = req.body.queryResult.parameters.person;
        const opcion_titulacion = req.body.queryResult.parameters.opcion_titulacion;
        const opcion_asignatura_informatica = req.body.queryResult.parameters.opcion_asignatura_informatica;

        // Verificar que todos los parámetros estén presentes
        if (!person) {
            return res.send({
                fulfillmentText: 'Necesito saber tu nombre'
            });
        }

        if (!opcion_titulacion) {
            return res.send({
                fulfillmentText: 'Necesito saber la titulacion'
            });
        }

        if (!opcion_asignatura_informatica) {
            return res.send({
                fulfillmentText: 'Necesito saber la asignatura'
            });
        }

        // SQL para insertar datos en la tabla asignaturas_table
        const sql = 'INSERT INTO asignaturas_table (nombre_usuario, titulacion, asignatura) VALUES (?, ?, ?)';
        db.query(sql, [person, opcion_titulacion, opcion_asignatura_informatica], (err, result) => {
            if (err) {
                console.error('Error al insertar datos:', err);
                return res.send({
                    fulfillmentText: 'Hubo un error al inscribir la asignatura. Por favor, inténtalo de nuevo.'
                });
            }

            res.send({
                fulfillmentText: `Asignatura ${opcion_asignatura_informatica} inscrita correctamente para ${person}.`
            });
        });
    } else {
        res.send({
            fulfillmentText: 'No entendí tu solicitud.'
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
