//Importamos bibliotecas
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

//Creamos el objeto app
const app = express();
app.use(bodyParser.json());
//Decidimos que el puerto sea o el permitido para el usuario o el 5000
app.set('port', process.env.PORT || 5000);

// Configurar conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_contraseña',
    database: 'tu_base_de_datos'
});


db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL');
});

//Endpoint que da respuesta texto plano
app.get("/", (req, res) => {
    res.send("API para realizar solicitudes con base de datos para funcionamiento chatbot de Dialogflow");
});

// Endpoint para manejar solicitudes de Dialogflow
app.post('/webhook', (req, res) => {
    const intent = req.body.queryResult.intent.displayName;

    if (intent === 'InscribirAsignaturaInformaticaIntent') {
        const person = req.body.queryResult.parameters.person;
        const opcion_titulacion = req.body.queryResult.parameters.opcion_titulacion;
        const opcion_asignatura_informatica = req.body.queryResult.parameters.opcion_asignatura_informatica;

        const sql = 'INSERT INTO asignaturas_table (nombre_usuario, opcion_titulacion, opcion_asignatura_informatica) VALUES (?, ?, ?)';
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

//Hacemos que la app escuche en el puerto dado anteriormente (el 5000)
app.listen(app.get('port'), () => {
    console.log('El servidor escucha en el puerto ', app.get('port'));
})

