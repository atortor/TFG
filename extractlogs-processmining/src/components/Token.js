import React from 'react';

/**
 * Componente de React que proporciona instrucciones detalladas para obtener un token de acceso.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Token />
 *
 * @description Se muestra una guía paso a paso para obtener un token de acceso necesario para
 *              la interacción entre DialogFlow y Google Cloud. Se detallan los permisos necesarios,
 *              la configuración de Google Cloud y los comandos a ejecutar en la terminal para
 *              obtener el token.
 *
 */
const Token = () => {
    return (
        <div className="obtener-token">
            <h2>Obtener token de acceso</h2>
            <p>Para obtener el token de acceso de un proyecto particular de DialogFlow, primero es necesario darle permisos a DialogFlow para realizar interacciones de log con Google Cloud. Para ello, sigue estos pasos:</p>
            <ol>
                <li>Accede a tu agente de DialogFlow y ve a <strong>Agente &gt; General</strong>. Habilita la opción <strong>Log interactions to Google Cloud</strong>.</li>
                <li>En la plataforma de Google Cloud, habilita la API de Cloud Logging.</li>
            </ol>
            <p>Con esto realizado, sigue los pasos a continuación:</p>
            <ol>
                <li>Instala Google Cloud SDK.</li>
                <li>Crea una cuenta de servicio con los permisos necesarios.</li>
                <li>Crea una clave JSON y guárdala en un lugar seguro.</li>
                <li>Para permitir ejecutar scripts en la terminal, ejecuta el siguiente comando:
                    <pre>Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser</pre>
                </li>
                <li>Asegúrate que estás en el proyecto correcto:
                    <pre>gcloud config set project ID_PROYECTO</pre>
                </li>
                <li>Configura el proyecto de cuota para las credenciales predeterminadas:
                    <pre>gcloud auth application-default set-quota-project ID_PROYECTO</pre>
                </li>
                <li>Autentícate otra vez:
                    <pre>gcloud auth application-default login</pre>
                </li>
                <li>Ejecuta los siguientes comandos en la terminal para obtener el token de acceso:
                    <pre>$env:GOOGLE_APPLICATION_CREDENTIALS="ruta\a\clave\json"</pre>
                    <pre>echo $env:GOOGLE_APPLICATION_CREDENTIALS</pre>
                    <pre>gcloud auth application-default print-access-token</pre>
                </li>
            </ol>
            <p>Con esto, obtendrás el token de acceso que debes proporcionar en la caja correspondiente junto al ID del proyecto.</p>
        </div>
    );
}

export default Token;