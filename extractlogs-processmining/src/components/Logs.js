import React from 'react';

/**
 * Componente realizado en React que muestra los logs obtenidos.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Logs logs={logsData} />
 *
 * @param {Object[]} logs - Array de objetos que contiene los logs a mostrar.
 *
 * @description Este componente muestra los logs en formato JSON.
 *              Si no hay logs disponibles, muestra un mensaje indicando que no hay logs disponibles
 *              posiblemente por introducir mal algún dato y recomendando comprobarlos
 *
 */
const Logs = ({ logs }) => {
    return (
        <div className="logs">
            {logs ? (
                <pre>{JSON.stringify(logs, null, 2)}</pre>
            ) : (
                <p>
                    No se han podido obtener logs. Comprobar si se han introducido los datos correctamente
                    o si realmente hay logs disponibles
                </p>
            )}
        </div>
    );
};

export default Logs;
