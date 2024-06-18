import React from 'react';

/**
 * Componente realizado en React que muestra los logs filtrados en una tabla.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <LogsFiltrados logs={logsData} />
 *
 * @param {Object[]} logs - Array de objetos que contiene los logs a mostrar, con los siguientes campos:
 * @param {string} logs[].timestamp - Marca de tiempo del log.
 * @param {string} logs[].caseId - ID del caso asociado al log.
 * @param {string} logs[].intentName - Nombre de la actividad registrada en el log.
 * @param {string} logs[].userResponse - Respuesta del usuario registrada en el log.
 *
 * @description Este componente muestra los logs filtrados en una tabla con columnas para el timestamp,
 *              ID del caso, nombre de la actividad y respuesta del usuario.
 *              Si no hay logs disponibles, muestra un mensaje indicando que no hay logs disponibles
 *              posiblemente por introducir mal algún dato y recomendando comprobarlos
 *
 */
const LogsFiltrados = ({ logs }) => {
    return (
        <div className="logs">
            {logs ? (
                <table>
                    <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Case ID</th>
                        <th>Activity Name</th>
                        <th>User Response</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.timestamp}</td>
                            <td>{log.caseId}</td>
                            <td>{log.intentName}</td>
                            <td>{log.userResponse}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>
                    No se han podido obtener logs. Comprobar si se han introducido los datos correctamente
                    o si realmente hay logs disponibles
                </p>
            )}
        </div>
    );
};

export default LogsFiltrados;