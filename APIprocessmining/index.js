//Importamos express para el desarrollo de API, mysql para la base de datos y myconn para la conexión entre
//express y mysql
const express = require('express');
const mysql = require('mysql');
const myconn = require('express-myconnection');
const cors = require('cors');
const fs = require('fs');
const {routes} = require('./routes');
const {readData, readDataFiltrado, writeDataFiltrado} = require('./fileOperations')
const saveLogs = require('./savelogs');

//Creamos el objeto app
const app = express();

//Decidimos que el puerto sea o el permitido para el usuario o el 5000
app.set('port', process.env.PORT || 5000);

//Opciones de la base de datos creada
const dbOptions = {
    host: 'localhost',
    port: 3306,
    user: 'Usuario',
    password: 'Contraseña',
    database: 'processmining'
};

//Middleware para que pueda conectarse a la base de datos y para que lea datos json
app.use(myconn(mysql, dbOptions, 'single'));
app.use(express.json());
app.use(cors());

//Endpoint que da respuesta texto plano
app.get("/", (req, res) => {
    res.send("API para la extracción y conversión en formato CSV de interacciones entre usuario y chatbot de DialogFlow");
});

//Endpoint que devuelva los logs sin filtrar
app.post("/logs", async (req, res) => {
    const { projectName, accessToken } = req.body;
    await saveLogs(projectName, accessToken);
    const data = readData();
    res.json(data.entries);
});

//Endpoint que devuelva las interacciones filtradas
app.get("/logs/interactions", (req, res) => {

    const data = readData();
    const dataFiltrado = { entries: [] };

    data.entries.forEach(log => {
        if (log.textPayload.includes("Dialogflow Response")) {
            const timestamp = log.timestamp;
            const caseId = log.trace;

            const intentNameMatch = log.textPayload.match(/intent_name: "(.*?)"/);
            const userResponseMatch = log.textPayload.match(/resolved_query: "(.*?)"/);

            if (intentNameMatch && userResponseMatch) {
                const intentName = intentNameMatch[1];
                const userResponse = userResponseMatch[1];

                const newInteraction = {
                    timestamp: timestamp,
                    caseId: caseId,
                    intentName: intentName,
                    userResponse: userResponse
                };

                dataFiltrado.entries.push(newInteraction);
            }
        }
    });

    writeDataFiltrado(dataFiltrado);
    res.json(dataFiltrado);
});

//Llamamos a la ruta api
app.use("/api", routes);

//Hacemos que la app escuche en el puerto dado anteriormente (el 5000)
app.listen(app.get('port'), () => {
    console.log('El servidor escucha en el puerto ', app.get('port'));
})

