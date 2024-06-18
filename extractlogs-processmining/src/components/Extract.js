import React from 'react';

/**
 * Componente realizado en React que muestra un mensaje de confirmación después de la descarga de un fichero CSV.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Extract />
 *
 * @description Este componente muestra un mensaje de confirmación indicando que un fichero en formato CSV
 *              ha sido descargado y está listo para ser analizado mediante minería de procesos.
 *              También da un mensaje de agradecimiento
 *
 */
const Extract = () => {
    return (
        <div className="extract">
            <p className="mensaje-extract">
                Ha sido descargado un fichero en formato CSV con las interacciones preparado para ser analizado por minería de procesos
            </p>
            <p className="gracias-extract">
                Gracias por hacer uso de esta web.
            </p>
        </div>
    );
};

export default Extract;