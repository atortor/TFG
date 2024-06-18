import React from 'react';

/**
 * Componente realizado en React que muestra la información del contacto del desarrollador.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Contacto />
 *
 * @description Se muestra información relevante sobre el desarrollador de la app, así como
 *              información correspondiente a para qué sirve realmente la app y por cual propósito
 *              fue realizada. También se informa del apoyo de una API REST para el funcionamiento de la app
 *
 */
const Contacto = () => {
    return (
        <div className="contacto">
            <h2>Contacto</h2>
            <p>
                <strong>Nombre:</strong>
                Torres Torres, Antonio Javier
            </p>
            <p>
                <strong>Universidad:</strong>
                Universidad de Granada (UGR)
            </p>
            <p>
                <strong>Centro universitario:</strong>
                Escuela Técnica Superior de Ingenierías Informática y de Telecomunicación (ETSIIT)
            </p>
            <p>
                <strong>Correo electrónico de contacto:</strong>
                <a href="mailto:atortor@correo.ugr.es">atortor@correo.ugr.es</a>
            </p>
            <p>
                <strong>Descripción:</strong>
                App desarrollada en Node.js con el apoyo de Express, de Axios y de React.
                Esta app ha sido desarrollada para la extracción de interacciones de diálogo
                entre usuarios y un chatbot desarrollado en DialogFlow en formato CSV, útil para ser
                estudiado por herramientas de minería de procesos como Disco para poder ser analizado y
                extraer una gran cantidad de información de estas interacciones. Esta App está apoyada en
                una API REST la cual se comunica con Cloud Logging para la extracción y conversión de
                interacciones en el formato deseado.
            </p>
        </div>
    );
}

export default Contacto;
