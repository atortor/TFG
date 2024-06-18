const express = require('express');
const routes = express.Router();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const { readDataFiltrado } = require('./fileOperations');

routes.get("/", (req, res) => {
    const dataFiltrado = readDataFiltrado();

    req.getConnection((err, conn) => {
        if (err) throw err;

        dataFiltrado.entries.forEach(entry => {
            const timestamp = entry.timestamp;
            const caseId = entry.caseId;
            const intentName = entry.intentName;
            const userResponse = entry.userResponse;

            const checkQuery = "SELECT * FROM eventlog WHERE timestamp = ?";
            const checkValues = [timestamp];

            conn.query(checkQuery, checkValues, (err, result) => {
                if (err) {
                    console.error('Error al verificar duplicado:', err);
                    return;
                }

                if (result.length === 0) {
                    const insertQuery = "INSERT INTO eventlog (timestamp, case_id, activity_name, user_response) VALUES (?, ?, ?, ?)";
                    const insertValues = [timestamp, caseId, intentName, userResponse];

                    conn.query(insertQuery, insertValues, (err, result) => {
                        if (err) {
                            console.error('Error al insertar el registro:', err);
                            return;
                        }
                        console.log("Fila insertada correctamente:", result);
                    });
                } else {
                    console.log("Ya existe un registro con el timestamp:", timestamp);
                }
            });
        });

        res.send("Datos filtrados insertados en la base de datos correctamente.");
    });
});

routes.get("/export/csv", (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        conn.query('SELECT * FROM eventlog', (err, rows) => {
            if (err) return res.send(err);

            if (!rows || rows.length === 0) {
                return res.status(404).send('No se encontraron registros para exportar.');
            }

            const csvWriter = createCsvWriter({
                path: path.join(__dirname, 'eventlog.csv'),
                header: Object.keys(rows[0]).map(key => ({ id: key, title: key }))
            });

            csvWriter.writeRecords(rows)
                .then(() => {
                    res.download(path.join(__dirname, 'eventlog.csv'), 'eventlog.csv', (err) => {
                        if (err) {
                            console.error('Error al enviar el archivo CSV:', err);
                            res.status(500).send('Error al generar el archivo CSV');
                        } else {
                            console.log('Archivo CSV enviado correctamente');
                            fs.unlink(path.join(__dirname, 'eventlog.csv'), (err) => {
                                if (err) {
                                    console.error('Error al eliminar el archivo CSV:', err);
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('Error al escribir en el archivo CSV:', error);
                    res.status(500).send('Error al generar el archivo CSV');
                });
        });
    });
});

module.exports = { routes };

