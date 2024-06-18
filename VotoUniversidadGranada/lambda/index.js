/************************************ INICIO IMPORTACIONES MÓDULOS ************************************/

// Importación del módulos
const Alexa = require('ask-sdk-core'); //para usar la API del Kit de Habilidades de Alexa
const AWS = require('aws-sdk'); //para conectarse y hacer operaciones en una base de datos de DynamoDB de una cuenta AWS

AWS.config.update({ region: 'us-east-1' }); //para tener misma region en la cuenta de la skill y la de AWS. 

// Obtención del adaptador de persistencia para guardar de forma permanente los datos en la base de datos
var persistenceAdapter = getPersistenceAdapter();

//Importamos los interceptors, los cuales son guardados en interceptors.js. 
const { 
    LoggingRequestInterceptor,
    LoggingResponseInterceptor,
    LocalizationRequestInterceptor,
    LoadAttributesRequestInterceptor,
    SaveAttributesResponseInterceptor
} = require('./interceptors'); 

//Importamos los manejadores adicionales (para ayudar, para parar la aplicación, etc), los cuales son guardados en additionalhandlers.js
const { 
    HelpIntentHandler,
    IntentReflectorHandler,
    StopIntentHandler,
    CancelIntentHandler,
    SessionEndedRequestHandler,
    FallbackIntentHandler,
    ErrorHandler
} = require('./additionalhandlers');

/************************************ FIN IMPORTACIONES MÓDULOS ************************************/

/************************************ INICIO MULTIMODAL RESPONSE ************************************/

//Constantes con el nombre de cada "pantalla" posible que se encuentran en el multimodal response de la skill. Contienen el nombre de estas "pantallas"
const DOCUMENT_INICIO = "inicio";
const DOCUMENT_TITULACION = "titulacion";
const DOCUMENT_ASIGNATURA = "asignatura";
const DOCUMENT_OPCIONES = "opciones";
const DOCUMENT_VOTACIONESABIERTAS = "votacionesabiertas";

//Array con las rutas hacia los colores para ser mostrados en las "pantallas"
 const colores = ["https://upload.wikimedia.org/wikipedia/commons/1/10/Red_Color.jpg", "https://upload.wikimedia.org/wikipedia/commons/f/ff/Solid_blue.svg", "https://upload.wikimedia.org/wikipedia/commons/0/09/Solid_yellow.svg", "https://upload.wikimedia.org/wikipedia/commons/1/16/Solid_lime.svg"]

/**
 * @description Multimodal response para la pantalla de inicio de la skill
 *              Esta fuente de datos proporciona la información necesaria para configurar la pantalla de inicio de la skill.
 *              Es de tipo simple, es decir, incluye una imagen de fondo, texto principal diciendo qué hacer y un mensaje de sugerencia para el usuario.
 */
const datasourceInicio = {
    "headlineTemplateData": {
        "type": "object",
        "objectId": "headlineSample",
        "properties": {
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "Bienvenido a Voteugr. App para la decisión de fecha de exámenes mediante encuestas"
                }
            },
            "logoUrl": "",
            "hintText": "Intenta: \"Alexa, quiero lanzar una encuesta\""
        }
    }
};

/**
 * @description Multimodal response para la pantalla de elección de titulación de la skill
 *              Esta fuente de datos proporciona la información necesaria para configurar la pantalla al estar eligiéndose la titulación de la cual se quiere lanzar una encuesta o inscribirse
 *              Es de tipo simple, es decir, incluye una imagen de fondo, texto principal diciendo qué hacer y un mensaje de sugerencia para el usuario.
 */
const datasourceTitulacion = {
    "headlineTemplateData": {
        "type": "object",
        "objectId": "headlineSample",
        "properties": {
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "Diga una titulación que pertenezca a la UGR"
                }
            },
            "logoUrl": "",
            "hintText": "Por ejemplo: \"Ingeniería Informática\""
        }
    }
};

/**
 * @description Multimodal response para la pantalla de elección de asignatura de la skill
 *              Esta fuente de datos proporciona la información necesaria para configurar la pantalla al estar eligiéndose la asignatura de la cual se quiere lanzar una encuesta o inscribirse
 *              Es de tipo simple, es decir, incluye una imagen de fondo y texto principal diciendo qué hacer.
 */
const datasourceAsignatura = {
    "headlineTemplateData": {
        "type": "object",
        "objectId": "headlineSample",
        "properties": {
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "Diga una asignatura perteneciente a la titulación escogida"
                }
            },
            "logoUrl": ""
        }
    }
};

/**
 * @description Multimodal response para la pantalla de elección del título y opciones al lanzar una encuesta de la skill
 *              Esta fuente de datos proporciona la información necesaria para configurar la pantalla al estar tomando la decisión del título y las opciones pertinentes para crear una votación
 *              Es de tipo simple, es decir, incluye una imagen de fondo, texto principal diciendo qué hacer y un mensaje de sugerencia para el usuario.
 */
const datasourceOpciones = {
    "headlineTemplateData": {
        "type": "object",
        "objectId": "headlineSample",
        "properties": {
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "Escuche a Alexa. Cuando aparezca la luz en azul, diga lo solicitado"
                }
            },
            "logoUrl": "",
            "hintText": "Intentar para indicar que finaliza opciones: \"El fin\""
        }
    }
};

/**
 * @description Crea un objeto de carga útil para enviar un documento APL.
 *              Este método crea y devuelve un objeto que contiene la información necesaria para enviar un documento APL
 *              para su renderización en un dispositivo Alexa con capacidad de mostrarlo por pantalla.
 * 
 * @param {string} aplDocumentId - El ID del documento APL que se va a renderizar.
 * @param {object} dataSources - Las fuentes de datos que se utilizarán en el documento APL.
 * @param {string} tokenId - El token único asociado con el documento APL.
 * @returns {object} - Objeto de carga útil para enviar el documento APL.
 */
const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

/************************************ FIN MULTIMODAL RESPONSE ************************************/

/************************************ INICIO FUNCIONES ************************************/

/**
 * @function getPersistenceAdapter
 * @summary Esta función devuelve un adaptador de persistencia basado en si la habilidad está alojada en Alexa o no.
 * @description Esta función determina si la habilidad está alojada en Alexa o no mediante la comprobación de la presencia de la variable de entorno S3_PERSISTENCE_BUCKET. 
 *              Si la habilidad está alojada en Alexa, devuelve un S3PersistenceAdapter configurado con el nombre del bucket S3. 
 *              De lo contrario, devuelve un DynamoDbPersistenceAdapter configurado con el nombre de tabla especificado.
 * @returns {object} Devuelve un adaptador de persistencia basado en el entorno de alojamiento.
*/
function getPersistenceAdapter() {
    /*  Pequeña función auxiliar que comprueba si la habilidad está alojada en Alexa.
     *  Se apoya en observar la presencia de la variable de entorno S3_PERSISTENCE_BUCKET para ver si está alojada en Alexa. 
     *  Devuelve TRUE si lo está y FALSE si no.
     */
    function isAlexaHosted() {
        return process.env.S3_PERSISTENCE_BUCKET ? true : false;
    }
    // Define el nombre de tabla para DynamoDB
    const tableName = 'asignaturas_table';
    // Si la habilidad está alojada en Alexa
    if(isAlexaHosted()) {
        // Importa S3PersistenceAdapter
        const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
        // Devuelve una instancia de S3PersistenceAdapter
        return new S3PersistenceAdapter({ 
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    //Si no está alojada
    } else {
        // Devuelve una instancia de DynamoDbPersistenceAdapter
        const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
        return new DynamoDbPersistenceAdapter({ 
            tableName: tableName,
            createTable: true
        });
    }
}


/************************************ FIN FUNCIONES  ************************************/

/************************************ INICIO HANDLERS PRINCIPALES ************************************/

/**
 * @description Controlador para las solicitudes de inicio ("LaunchRequest").
 *              Este controlador se activa cuando el usuario inicia la skill sin proporcionar una intención específica.
 *              Da la bienvenida al usuario, inicializa y reinicia los atributos de sesión según sea necesario,
 *              y proporciona instrucciones o información adicional sobre cómo interactuar con la skill.
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta de bienvenida y proporciona instrucciones adicionales para el usuario.
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        // Verifica si el tipo de solicitud es 'LaunchRequest'
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {

        // Obtiene el attributesManager del handlerInput
        const {attributesManager} = handlerInput;
        // Obtiene los atributos de solicitud y de sesión
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Restablece varias claves en sessionAttributes
        sessionAttributes.lanzarEncuestaIntentEjecutado = false;
        sessionAttributes.lanzarEncuestaIntentEjecutado2 = false;
        sessionAttributes.lanzarEncuestaIntentEjecutado3 = false;
        sessionAttributes.lanzarEncuestaIntentEjecutado4 = false;

        sessionAttributes.inscribirAsignaturaIntentEjecutado = false;
        sessionAttributes.inscribirAsignaturaIntentEjecutado2 = false;

        sessionAttributes.votacionEncuesta = false;
        sessionAttributes.votacionEncuesta2 = false;

        sessionAttributes.eliminarEncuesta = false;

        sessionAttributes.indiceVotacionesAbiertas = 1;

        let speechText = '';

        // Obtiene el valor actual del contador de sesión
        let contador = sessionAttributes.contador || 1;

        // Incrementa el contador para la próxima sesión
        contador++;

        // Establece el valor del contador en los atributos de sesión
        sessionAttributes.contador = contador;

        // Guarda los cambios en los atributos de sesión
        attributesManager.setSessionAttributes(sessionAttributes);

        const userId = handlerInput.requestEnvelope.session.user.userId;

        if (sessionAttributes.mensajeBienvenida) {

            speechText =  requestAttributes.t('NOTWELCOME_MSG');

        } else {

            speechText =  requestAttributes.t('WELCOME_MSG');

            // Establece el indicador de que se ha mostrado el mensaje de bienvenida largo
            sessionAttributes.mensajeBienvenida = true;

            // Guarda los cambios en los atributos de sesión
            attributesManager.setSessionAttributes(sessionAttributes);
        }


        // Define los parámetros para la consulta de elementos en la tabla "opciones_votacion_table"
        const paramsQuery = {
            TableName: 'opciones_votacion_table',
            Select: 'COUNT' // Selecciona solo el recuento de elementos, no los datos reales
        };

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });

        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // Realiza la consulta para contar el número de elementos en la tabla
        dynamoDB.scan(paramsQuery, function(err, data) {
            if (err) {
                console.error("Error al escanear la tabla:", err);
            } else {
                const itemCount = data.Count;
                // Verifica si la tabla está vacía
                if (itemCount === 0) {
                    // La tabla está vacía, establece el atributo de sesión como '1'
                    sessionAttributes.indiceGlobalOpciones = '1';
                }
            }
        });

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que se devolverá desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_INICIO, datasourceInicio);
            // Añade la directiva RenderDocument al responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/**
 * @description Controlador para la intención LanzarEncuestaIntent.
 *              Este controlador se activa cuando el usuario solicita iniciar una encuesta.
 *              Marca la ejecución de la intención LanzarEncuestaIntent y responde con un mensaje
 *              que indica que la encuesta está en proceso de lanzamiento, solicitando la titulación.
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud procesada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje de inicio de encuesta solicitando la titulación.
 */
const LanzarEncuestaIntentHandler = {
    canHandle(handlerInput) {
        // Verifica si el tipo de solicitud es 'IntentRequest' y si el nombre del intento es 'LanzarEncuestaIntent'
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LanzarEncuestaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marca que LanzarEncuestaIntent ha sido ejecutado
        sessionAttributes.lanzarEncuestaIntentEjecutado = true;

        const userId = handlerInput.requestEnvelope.session.user.userId;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userresponse = intent.slots.textLanzarEncuesta.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // Registra el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: userresponse }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();

        let message = ' ¿Cuál elige?';

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_TITULACION, datasourceTitulacion);
            // Añade la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('LAUNCHSURVEY_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Controlador para la intención ElegirTitulacionEncuestaIntentHandler.
 *              Este controlador se activa cuando el usuario selecciona una titulación después de iniciar una encuesta.
 *              Marca la ejecución de la intención ElegirTitulacionIntent y responde con un mensaje solicitando la asignatura de la titulación seleccionada.
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud procesada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje de encuesta solicitando la asignatura de la titulación elegida.
 */
const ElegirTitulacionEncuestaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Verifica si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.lanzarEncuestaIntentEjecutado === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirTitulacionIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marca que ElegirTitulacionIntent ha sido ejecutado
        sessionAttributes.lanzarEncuestaIntentEjecutado2 = true;

        const userId = handlerInput.requestEnvelope.session.user.userId;

        // Obtiene el nombre de la titulación seleccionada desde los slots de la intención
        const titulacion = intent.slots.numero_opcion_titulacion.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        // Guarda la titulación seleccionada en los atributos de sesión
        sessionAttributes['titulacion'] = titulacion;

        let message = ' ¿Cuál elige?';

        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // Guarda el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: titulacion }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo ítem a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_ASIGNATURA, datasourceAsignatura);
            // Añade la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('CHOOSELAUNCHSUBJECT_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Controlador para la intención ElegirAsignaturaIntent.
 *              Este controlador se activa cuando el usuario selecciona una asignatura específica de "Ingeniería Informática" después de haber indicado que desea lanzar una encuesta y haber seleccionado una titulación.
 *              Marca la ejecución de la intención ElegirAsignaturaIntent y responde con una solicitud para que el usuario proporcione el título de la encuesta que desea lanzar.
 *              Se indica que para finalizar la provisión de las opciones pertinentes después del título, es necesario decir las palabras "El fin".
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud procesada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje solicitando el título de la encuesta que se desea lanzar.
 */
const ElegirAsignaturaInformaticaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.lanzarEncuestaIntentEjecutado === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado2 === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado3 === false &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirAsignaturaInformaticaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marca que ElegirAsignaturaIntent ha sido ejecutado
        sessionAttributes.lanzarEncuestaIntentEjecutado3 = true;

        const userId = handlerInput.requestEnvelope.session.user.userId;

        // Obtener el nombre y el ID de la asignatura seleccionada desde los slots de la intención
        const asignatura = intent.slots.opcion_asignatura.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const idasignatura = intent.slots.opcion_asignatura.resolutions.resolutionsPerAuthority[0].values[0].value.id;

        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);

        // Establecer la asignatura seleccionada y su ID en los atributos de sesión
        sessionAttributes['asignatura'] = asignatura;
        sessionAttributes['idasignatura'] = idasignatura;

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // En caso de crear una votación para una asignatura que no existe, la ingresamos en la base de datos en la tabla asignaturas_table
        const parametrosAsignatura = {
            TableName: 'asignaturas_table',
            Item: {
                'id_asignatura': { S: idasignatura },
                'nombre_asignatura': { S: asignatura },
                'titulacion': { S: sessionAttributes['titulacion'] }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo ítem a la tabla
        await dynamoDB.putItem(parametrosAsignatura).promise();

        // Guardamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: asignatura }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo ítem a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();

        // Obtener el mensaje de bienvenida de los atributos de solicitud
        const speechText = requestAttributes.t('CHOOSELAUNCHTITULE_MSG');

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_OPCIONES, datasourceOpciones);
            // Agrega la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Controlador para la intención ElegirAsignaturaTelecoIntent.
 *              Este controlador se activa cuando el usuario selecciona una asignatura específica de "Ingeniería de Tecnologías de Telecomunicación" después de haber indicado el deseo de lanzar una encuesta y haber seleccionado una titulación.
 *              Marca la ejecución de la intención ElegirAsignaturaTelecoIntent y responde solicitando el título de la encuesta que se desea lanzar.
 *              Se indica que para finalizar la provisión de las opciones pertinentes después del título, es necesario decir las palabras "El fin".
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud procesada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje solicitando el título de la encuesta que se desea lanzar.
 */
const ElegirAsignaturaTelecoIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.lanzarEncuestaIntentEjecutado === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado2 === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado3 === false &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirAsignaturaTelecoIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marcar que ElegirAsignaturaTelecoIntent ha sido ejecutado
        sessionAttributes.lanzarEncuestaIntentEjecutado3 = true;

        const userId = handlerInput.requestEnvelope.session.user.userId;

        // Obtener el nombre y el ID de la asignatura seleccionada desde los slots de la intención
        const asignatura = intent.slots.opcion_asignatura_teleco.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const idasignatura = intent.slots.opcion_asignatura_teleco.resolutions.resolutionsPerAuthority[0].values[0].value.id;

        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);

        // Establecer la asignatura seleccionada y su ID en los atributos de sesión
        sessionAttributes['asignatura'] = asignatura;
        sessionAttributes['idasignatura'] = idasignatura;

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // En caso de crear una votación para una asignatura que no existe, la ingresamos en la base de datos en la tabla asignaturas_table
        const parametrosAsignatura = {
            TableName: 'asignaturas_table',
            Item: {
                'id_asignatura': { S: idasignatura },
                'nombre_asignatura': { S: asignatura },
                'titulacion': { S: sessionAttributes['titulacion'] }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo ítem a la tabla
        await dynamoDB.putItem(parametrosAsignatura).promise();

        // Guardamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: asignatura }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo ítem a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();

        // Obtener el mensaje de bienvenida de los atributos de solicitud
        const speechText = requestAttributes.t('CHOOSELAUNCHTITULE_MSG');

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_OPCIONES, datasourceOpciones);
            // Agrega la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};


/**
 * @description Manejador para la intención CrearTituloEncuestaIntent.
 *              Este manejador se activa cuando el usuario crea un título para la encuesta después de seleccionar la asignatura.
 *              Marca la ejecución de la intención CrearTituloEncuestaIntent y responde con un mensaje solicitando las opciones que va a tener esta encuesta.
 *              
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje solicitando las opciones que va a tener esta encuesta.
 */
const CrearTituloEncuestaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.lanzarEncuestaIntentEjecutado === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado2 === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado3 === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'CrearTituloEncuestaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        
        // Marcar que ElegirTitulacionIntent se ha lanzado
        sessionAttributes.lanzarEncuestaIntentEjecutado4 = true;
        
        // Obtener el nombre del título de la encuesta desde los slots de la intención
        const titulo = intent.slots.nombre_titulo.value;
        
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        
        // Obtener el ID de usuario de la sesión
        const userId = handlerInput.requestEnvelope.session.user.userId;

        
        // Establecer el título de la encuesta en los atributos de sesión
        sessionAttributes['titulo'] = titulo;
        
        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR' 
        }).promise();
    
        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });
        
        // Guardamos el titulo de la votacion así como la asignatura a la que va dirigida en la base de datos, específicamente en la tabla votaciones_table
        const parametrosTituloVotacion = {
            TableName: 'votaciones_table',
            Item: {
                'nombre_votacion': { S: titulo },
                'id_asignatura': { S: sessionAttributes['idasignatura'] },
                'id_usuario': { S: userId }
            }
        };
    
        // Ejecutamos la operación putItem para guardar el item en la tabla
        await dynamoDB.putItem(parametrosTituloVotacion).promise();
        
        // Almacenamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: titulo }
            }
        };
    
        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();
        
        // Obtener el mensaje de bienvenida de los atributos de solicitud
        const speechText = requestAttributes.t('CHOOSELAUNCHOPTION_MSG', 'uno');
        
        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Manejador para la intención CrearOpcionesEncuestaIntent.
 *              Este manejador se activa cuando el usuario crea opciones para la encuesta después de ingresar el título.
 *              Almacena las opciones proporcionadas por el usuario y controla el proceso de recopilación de opciones.
 *              Se va ejecutando en bucle hasta que se pronuncian las palabras "El fin", las cuales indica el fin de la toma de opciones.
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje de confirmación o una solicitud para la siguiente opción.
 */
 const CrearOpcionesEncuestaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.lanzarEncuestaIntentEjecutado === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado2 === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado3 === true &&
            sessionAttributes.lanzarEncuestaIntentEjecutado4 === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'CrearOpcionesEncuestaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        
        let message = '';
        
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const opcionUsuario = intent.slots.fecha_opcion.value;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        
        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR' 
        }).promise();
    
        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });
            
        if (opcionUsuario && opcionUsuario !== 'fin') {
            
            // Realizamos los parametros de la votacion para guardarla en la base de datos, específicamente en opciones_votacion_table, la cual tendrá como predeterminado 0 votos
            const parametrosOpcionesVotacion = {
                TableName: 'opciones_votacion_table',
                Item: {
                    'id_opcion': { N: sessionAttributes.indiceGlobalOpciones },
                    'nombre_votacion': { S: sessionAttributes['titulo'] },
                    'opcion' : { S: opcionUsuario },
                    'conteo_votos' : { N: '0' }
                }
            };
            
            
            // Guardamos la opcion en la tabla 
            await dynamoDB.putItem(parametrosOpcionesVotacion).promise();
            
            // Almacenamos el evento con sus propiedades correspondientes
            const parametrosRegistro = {
                TableName: 'registros_table',
                Item: {
                    'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                    'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                    'activity_name': { S: activityname.toString() },
                    'resource': { S: userId },
                    'user_response': { S: opcionUsuario }
                }
            };
    
            // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
            await dynamoDB.putItem(parametrosRegistro).promise();
        
            //Pasamos a entero indiceGlobalOpciones (tenia que estar en string para ser guardado en la tabla)
            parseInt(sessionAttributes.indiceGlobalOpciones, 10);
            
            //Aumentamos en uno el valor y lo pasamos otra vez a string (es un identificador que solo aumenta para guardar el id de las opciones)
            sessionAttributes.indiceGlobalOpciones++;
            sessionAttributes.indiceGlobalOpciones = sessionAttributes.indiceGlobalOpciones.toString();
            
            // Solicitar la siguiente opción
            message += ' ¿Cuál es la siguiente opción?';
            
            return handlerInput.responseBuilder
                .speak(message)
                .reprompt(requestAttributes.t('HELP_MSG'))
                .getResponse();
        } else {
            
            // Limpiar los atributos relacionados con la encuesta  
            sessionAttributes['asignatura'] = '';
            sessionAttributes['idasignatura'] = '';
        
            // Resetear los indicadores de ejecución de las intenciones relacionadas con la encuesta
            sessionAttributes.lanzarEncuestaIntentEjecutado = false;
            sessionAttributes.lanzarEncuestaIntentEjecutado2 = false;
            sessionAttributes.lanzarEncuestaIntentEjecutado3 = false;
            sessionAttributes.lanzarEncuestaIntentEjecutado4 = false;
            
            // Devolver un mensaje de confirmación al usuario
            const speechText = requestAttributes.t('FINISHLAUNCHOPTION_MSG');
            
            // Devuelve el mensaje
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(requestAttributes.t('ERROR_MSG'))
                .getResponse();
        }
    }
};

/**
 * @description Manejador para la intención InscribirAsignaturaIntent.
 *              Este manejador se activa cuando el usuario solicita inscribirse en una asignatura
 *              Marca la ejecución de la intención InscribirAsignaturaIntent y responde con un mensaje
 *              que indica que la inscripción se está realizando, solicitando la titulación.
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje de inscripción de una asignatura solicitando la titulación.
 */
const InscribirAsignaturaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InscribirAsignaturaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marcar que InscribirAsignatura se ha ejecutado
        sessionAttributes.inscribirAsignaturaIntentEjecutado = true;
        
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userresponse = intent.slots.textInscribirAsignatura.resolutions.resolutionsPerAuthority[0].values[0].value.name;
         
        let message = ' ¿Cuál elige?';
        
        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR' 
        }).promise();
    
        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });
        
        // Almacenamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: userresponse }
            }
        };
    
        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();
            
        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_TITULACION, datasourceTitulacion);
            // Agrega la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('ENROLLSUBJECT_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Manejador para la intención ElegirTitulacionIntent.
 *              Este manejador se activa cuando el usuario elige la titulación después de idicar el deseo de inscribirse en una asignatura
 *              Marca la ejecución de la intención ElegirTitulacionIntent y responde solicitando la asignatura específica correspondiente.
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje solicitando la asignatura específica correspondiente.
 */
const ElegirTitulacionInscripcionIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.inscribirAsignaturaIntentEjecutado === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirTitulacionIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        
        // Marcar que ElegirTitulacionIntent se ha lanzado
        sessionAttributes.inscribirAsignaturaIntentEjecutado2 = true;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const titulacion = intent.slots.numero_opcion_titulacion.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const userId = handlerInput.requestEnvelope.session.user.userId;
        
        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR' 
        }).promise();
    
        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });
        
        // Almacenamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: titulacion }
            }
        };
    
        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();
        
        let message = ' ¿Cuál elige?';

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_ASIGNATURA, datasourceAsignatura);
            // Agrega la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('CHOOSEENROLLSUBJECT_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Manejador para la intenciónElegirAsignaturaInformaticaIntent.
 *              Este manejador se activa cuando el usuario elige una asignatura específica de "Ingeniería Informática" después de indicar el deseo de inscribirse en una asignatura.
 *              Marca la ejecución de la intención ElegirAsignaturaInformaticaIntent y responde indicando que ha sido inscrito en la asignatura
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje indicando que ha sido inscrito en la asignatura
 */
const InscripcionAsignaturaInformaticaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si IncripcionAsignaturaIntent se ha ejecutado antes
        return sessionAttributes.inscribirAsignaturaIntentEjecutado === true &&
            sessionAttributes.inscribirAsignaturaIntentEjecutado2 === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirAsignaturaInformaticaIntent';
    },
    async handle(handlerInput) {
        try {
            const {attributesManager} = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            const sessionAttributes = attributesManager.getSessionAttributes();
            const {intent} = handlerInput.requestEnvelope.request;

            // Obtener el ID de usuario de la sesión
            const userId = handlerInput.requestEnvelope.session.user.userId;
            const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
            
            // Obtener el ID de asignatura seleccionado desde los slots de la intención
            const idAsignatura = intent.slots.opcion_asignatura.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            const asignatura = intent.slots.opcion_asignatura.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            
            // Asume el rol de AWS mediante la acción STS
            const STS = new AWS.STS({ apiVersion: '2011-06-15' });
            const credentials = await STS.assumeRole({
                RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
                RoleSessionName: 'VoteUGR' 
            }).promise();
    
            // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
            const dynamoDB = new AWS.DynamoDB({
                apiVersion: '2012-08-10',
                accessKeyId: credentials.Credentials.AccessKeyId,
                secretAccessKey: credentials.Credentials.SecretAccessKey,
                sessionToken: credentials.Credentials.SessionToken
            });

            // Definir los parámetros para insertar la relación entre el usuario y la asignatura en la que se ha inscrito en inscripciones_table
            const parametrosInscripcion = {
                TableName: 'inscripciones_table',
                Item: {
                    'id_usuario': { S: userId },
                    'id_asignatura': { S: idAsignatura }
                }
            };

            // Ejecutar la operación putItem para guardar la inscripción
            await dynamoDB.putItem(parametrosInscripcion).promise();
            
            // Almacenamos el evento con sus propiedades correspondientes
            const parametrosRegistro = {
                TableName: 'registros_table',
                Item: {
                    'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                    'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                    'activity_name': { S: activityname.toString() },
                    'resource': { S: userId },
                    'user_response': { S: asignatura }
                }
            };
    
            // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
            await dynamoDB.putItem(parametrosRegistro).promise();
        
            // Crear un mensaje de confirmación al usuario
            const speechText = 'Se ha inscrito en la asignatura correctamente.';

            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(requestAttributes.t('ERROR_MSG'))
                .getResponse();
                
        } catch (error) {
            console.error('Error:', error);
            const speechText = 'Se produjo un error al realizar la inscripción en la asignatura.';

            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};


/**
 * @description Manejador para la intenciónElegirAsignaturaInformaticaIntent.
 *              Este manejador se activa cuando el usuario elige una asignatura específica de "Ingeniería de Tecnologías de Telecomunicación" después de indicar el deseo de inscribirse en una asignatura.
 *              Marca la ejecución de la intención ElegirAsignaturaTelecoIntent y responde indicando que ha sido inscrito en la asignatura
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye un mensaje indicando que ha sido inscrito en la asignatura
 */
const InscripcionAsignaturaTelecoIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si IncripcionAsignaturaIntent se ha ejecutado antes
        return sessionAttributes.inscribirAsignaturaIntentEjecutado === true &&
            sessionAttributes.inscribirAsignaturaIntentEjecutado2 === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ElegirAsignaturaTelecoIntent';
    },
    async handle(handlerInput) {
        try {
            const {attributesManager} = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            const sessionAttributes = attributesManager.getSessionAttributes();
            const {intent} = handlerInput.requestEnvelope.request;

            // Obtener el ID de usuario de la sesión
            const userId = handlerInput.requestEnvelope.session.user.userId;
            const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
            
            // Obtener el ID de asignatura seleccionado desde los slots de la intención
            const idAsignatura = intent.slots.opcion_asignatura_teleco.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            const asignatura = intent.slots.opcion_asignatura_teleco.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            
            // Asume el rol de AWS mediante la acción STS
            const STS = new AWS.STS({ apiVersion: '2011-06-15' });
            const credentials = await STS.assumeRole({
                RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
                RoleSessionName: 'VoteUGR' 
            }).promise();
    
            // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
            const dynamoDB = new AWS.DynamoDB({
                apiVersion: '2012-08-10',
                accessKeyId: credentials.Credentials.AccessKeyId,
                secretAccessKey: credentials.Credentials.SecretAccessKey,
                sessionToken: credentials.Credentials.SessionToken
            });

            // Definir los parámetros para insertar la relación entre el usuario y la asignatura en la que se ha inscrito en inscripciones_table
            const parametrosInscripcion = {
                TableName: 'inscripciones_table',
                Item: {
                    'id_usuario': { S: userId },
                    'id_asignatura': { S: idAsignatura }
                }
            };

            // Ejecutar la operación putItem para guardar la inscripción
            await dynamoDB.putItem(parametrosInscripcion).promise();

            // Almacenamos el evento con sus propiedades correspondientes
            const parametrosRegistro = {
                TableName: 'registros_table',
                Item: {
                    'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                    'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                    'activity_name': { S: activityname.toString() },
                    'resource': { S: userId },
                    'user_response': { S: asignatura }
                }
            };
    
            // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
            await dynamoDB.putItem(parametrosRegistro).promise();
            
            // Crear un mensaje de confirmación al usuario
            const speechText = 'Se ha inscrito en la asignatura correctamente.';

            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(requestAttributes.t('ERROR_MSG'))
                .getResponse();
                
        } catch (error) {
            console.error('Error:', error);
            const speechText = 'Se produjo un error al realizar la inscripción en la asignatura.';

            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
    }
};

/**
 * @description Manejador para la intención VerVotacionesIntent.
 *              Este manejador se activa cuando el usuario solicita ver las votaciones abiertas que están diponibles para él.
 *              Toda asignatura en la que está inscrito el alumno y que tiene una votación abierta tiene que aparecerle.
 *              Muestra las votaciones disponibles para el alumno y permite seleccionar una para modificar o ver resultados.
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye las votaciones disponibles y las instrucciones para interactuar con ellas.
 */
const VerVotacionesAbiertasIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'VerVotacionesIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        // Marcar que la votación de la encuesta se ha lanzado
        sessionAttributes.votacionEncuesta = true;

        let primaryTextArray = [];
        let imageSourceArray = [];
        let indexcolor = 0;

        // Obtener el ID de usuario de la sesión
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userresponse = intent.slots.textVotacionesAbiertas.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // Almacenamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: userresponse }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();

        // Definimos parametros para ver las asignaturas en las que está inscrito el usuario
        const parametrosAsignaturasUsuario = {
            TableName: 'inscripciones_table',
            KeyConditionExpression: 'id_usuario = :userId',
            ExpressionAttributeValues: {
                ':userId': { S: userId }
            }
        };

        // Realizamos la consulta con query
        const resultQuery = await dynamoDB.query(parametrosAsignaturasUsuario).promise();

        // Obtenemos las asignaturas y las guardamos en asignaturaIds
        const asignaturasIds = resultQuery.Items.map(item => item.id_asignatura.S);

        // Definimos los arrays para realizar consultas sobre cada asignatura y para obtener los nombres de las votaciones a los que pertenecen esas asignaturas
        const resultadoConsultaVotaciones = [];
        const nombreVotacionValues = [];

        //Recorremos las asignaturas en las que está inscrito el usuario
        for (const id of asignaturasIds) {
            //Para cada una, obtenemos los nombres de votaciones a las que están relacionadas, recorriéndolas mediante el índice id_asignatura-index
            const parametrosVotacionesAsignaturas = {
                TableName: 'votaciones_table',
                KeyConditionExpression: 'id_asignatura = :id',
                ExpressionAttributeValues: {
                    ':id': { S: id }
                },
                ProjectionExpression: 'nombre_votacion', // Proyección para obtener solo el nombre_votacion
                IndexName: 'id_asignatura-index'  // Utilizando el GSI id_asignatura-index
            };

            //Realizamos la consulta para cada asignatura, almacenando el nombre de la votación en resultadoConsultaVotaciones
            const result = await dynamoDB.query(parametrosVotacionesAsignaturas).promise();
            resultadoConsultaVotaciones.push(result);

            // Si se encontraron resultados, extraer los nombres de votacion y añadirlos a nombreVotacionValues
            for (const item of result.Items) {
                const nombreVotacion = item.nombre_votacion.S;
                nombreVotacionValues.push(nombreVotacion);
            }
        }

        // Procesar los resultados para construir el mensaje
        // Construir el mensaje con las opciones
        let message = '';

        //Mostramos el nombre de cada votacion a la que está inscrito el usuario, guardándolo para hacerlo también en el multimodal response
        if (nombreVotacionValues.length > 0) {
            message = `${nombreVotacionValues.join(', ')}`;
            nombreVotacionValues.forEach((nombreVotacion, index) => {
                primaryTextArray.push(nombreVotacion);
                const indexcolor = index >= 4 ? index - 4 : index;
                imageSourceArray.push(colores[indexcolor]);
            });
        } else {
            message = 'No estás inscrito en ninguna asignatura con votacion lanzada.';
        }

        // Agregar instrucciones para interactuar con las votaciones
        message += '. Seleccione la opción de la cual quiere modificar y observar resultados diciendo “La votación llamada ” y el título de la votación la cual está interesado. Para salir, simplemente diga “Alexa, cierra”';

        const votacionesAbiertas = primaryTextArray.map((primaryText, index) => ({
            primaryText,
            imageSource: imageSourceArray[index]
        }));

        const datasourceVotacionesAbiertas = {
            "imageListData": {
                "type": "object",
                "objectId": "imageListSample",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                            "size": "large"
                        }
                    ]
                },
                "listItems": votacionesAbiertas.map(votacion => ({
                    "primaryText": votacion.primaryText,
                    "imageSource": votacion.imageSource
                })),
                "logoUrl": "",
                "hintText": "Intenta: \"La votación llamada...\""
            }
        };

        // Si el dispositivo es compatible con la interfaz de presentación APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Genera la directiva APL RenderDocument que será devuelta desde tu skill
            const aplDirective = createDirectivePayload(DOCUMENT_VOTACIONESABIERTAS, datasourceVotacionesAbiertas);
            // Agrega la directiva al Echo con pantalla
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Restablecer el índice de votaciones abiertas
        sessionAttributes.indiceVotacionesAbiertas = 1;

        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('OPENVOTING_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Controlador para la intención EliminarVotacionIntent.
 *              Este controlador se activa cuando el usuario solicita eliminar una de sus votaciones.
 *              Cualquier votación creada por el usuario y que está activa debe ser mostrada.
 *              Permite al usuario ver las votaciones disponibles y seleccionar una para eliminar.
 *
 * @param {object} handlerInput - El objeto que contiene la solicitud procesada.
 * @returns {object} - Devuelve una respuesta que incluye las votaciones disponibles y las instrucciones para interactuar con ellas.
 */
const EliminarEncuestaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'EliminarVotacionIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const { intent } = handlerInput.requestEnvelope.request;

        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userresponse = intent.slots.textEliminarEncuesta.resolutions.resolutionsPerAuthority[0].values[0].value.name;

        // Marcar que se ha iniciado el proceso de eliminación de la encuesta
        sessionAttributes.eliminarEncuesta = true;
        sessionAttributes.votacionEncuesta = false;

        let primaryTextArray = [];
        let imageSourceArray = [];
        let indexcolor = 0;

        // Obtener el ID de usuario de la sesión actual
        const userId = handlerInput.requestEnvelope.session.user.userId;

        // Asumir un rol de AWS para obtener permisos mediante STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR'
        }).promise();

        // Crear una instancia de DynamoDB utilizando las credenciales obtenidas
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });

        // Registro del evento con sus propiedades en DynamoDB
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() },
                'case_id': { N: sessionAttributes.contador.toString() },
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: userresponse }
            }
        };

        // Ejecutar la operación putItem para registrar el evento
        await dynamoDB.putItem(parametrosRegistro).promise();

        // Definir arrays para las consultas de votaciones y los nombres de las votaciones creadas por el usuario
        const resultadoConsultaVotaciones = [];
        const nombreVotacionValues = [];

        // Consultar los nombres de las votaciones creadas por el usuario utilizando el índice id_usuario-index
        const parametrosVotacionesAsignaturas = {
            TableName: 'votaciones_table',
            KeyConditionExpression: 'id_usuario = :id',
            ExpressionAttributeValues: {
                ':id': { S: userId }
            },
            ProjectionExpression: 'nombre_votacion',
            IndexName: 'id_usuario-index'
        };

        // Ejecutar la consulta y almacenar los nombres de las votaciones en resultadoConsultaVotaciones
        const result = await dynamoDB.query(parametrosVotacionesAsignaturas).promise();
        resultadoConsultaVotaciones.push(result);

        // Si se encuentran resultados, extraer los nombres de las votaciones y añadirlos a nombreVotacionValues
        for (const item of result.Items) {
            const nombreVotacion = item.nombre_votacion.S;
            nombreVotacionValues.push(nombreVotacion);
        }

        // Procesar los resultados para construir el mensaje de respuesta
        let message = '';

        // Mostrar el nombre de cada votación creada por el usuario y guardarlo para la respuesta multimodal
        if (nombreVotacionValues.length > 0) {
            message = `${nombreVotacionValues.join(', ')}`;
            nombreVotacionValues.forEach((nombreVotacion, index) => {
                primaryTextArray.push(nombreVotacion);
                const indexcolor = index >= 4 ? index - 4 : index;
                imageSourceArray.push(colores[indexcolor]);
            });
        } else {
            message = 'No ha creado ninguna votación';
        }

        // Agregar instrucciones para interactuar con las votaciones
        message += '. Seleccione la opción de la cual quiere eliminar “La votación llamada ” y el título de la votación que busca borrar. Para salir, simplemente diga “Cierra”';

        const votacionesAbiertas = primaryTextArray.map((primaryText, index) => ({
            primaryText,
            imageSource: imageSourceArray[index]
        }));

        const datasourceVotacionesAbiertas = {
            "imageListData": {
                "type": "object",
                "objectId": "imageListSample",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                            "size": "large"
                        }
                    ]
                },
                "listItems": votacionesAbiertas.map(votacion => ({
                    "primaryText": votacion.primaryText,
                    "imageSource": votacion.imageSource
                })),
                "logoUrl": "",
                "hintText": "Intenta: \"La votación llamada...\""
            }
        };

        // Si el dispositivo es compatible con APL, agregar directiva APL
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_VOTACIONESABIERTAS, datasourceVotacionesAbiertas);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // Restablecer el índice de votaciones abiertas
        sessionAttributes.indiceVotacionesAbiertas = 1;

        // Devolver el mensaje de respuesta
        return handlerInput.responseBuilder
            .speak(`${requestAttributes.t('OPENDELETEVOTING_MSG')} ${message}`)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};



/**
 * @description Manejador para la intención VotarAsignaturaIntent.
 *              Este manejador se activa cuando el usuario desea eliminar una votación creada por él
 *              Avisa al usuario de la eliminación correcta o no de la votación
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que incluye la aprobación o fracaso de la eliminación de la votación
 */
const EliminarVotacionesDefinitivoIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        return sessionAttributes.eliminarEncuesta === true &&
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'VotarAsignaturaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        //Guardamos el nombre de la votación elegida
        const nombreVotacion = intent.slots.nombrevotacion.value;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userId = handlerInput.requestEnvelope.session.user.userId;
        
        let speechText = '';
        
        try {
            // Asume el rol de AWS mediante la acción STS
            const STS = new AWS.STS({ apiVersion: '2011-06-15' });
            const credentials = await STS.assumeRole({
                RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
                RoleSessionName: 'VoteUGR' 
            }).promise();
    
            // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
            const dynamoDB = new AWS.DynamoDB({
                apiVersion: '2012-08-10',
                accessKeyId: credentials.Credentials.AccessKeyId,
                secretAccessKey: credentials.Credentials.SecretAccessKey,
                sessionToken: credentials.Credentials.SessionToken
            });
            
            // Almacenamos el evento con sus propiedades correspondientes
            const parametrosRegistro = {
                TableName: 'registros_table',
                Item: {
                    'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                    'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                    'activity_name': { S: activityname.toString() },
                    'resource': { S: userId },
                    'user_response': { S: nombreVotacion }
                }
            };
    
            // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
            await dynamoDB.putItem(parametrosRegistro).promise();
        
            // Verificar si la votación existe en la tabla votaciones_table
            const parametrosConsultaVotacion = {
                TableName: 'votaciones_table',
                KeyConditionExpression: 'nombre_votacion = :nombreVotacion',
                ExpressionAttributeValues: {
                    ':nombreVotacion': { S: nombreVotacion }
                },
            };

            const resultQueryVotacion = await dynamoDB.query(parametrosConsultaVotacion).promise();
            
            if (resultQueryVotacion.Items.length === 0) {
                // Si la votación no existe, devolver mensaje de error
                let message = `La votación ${nombreVotacion} no existe. Por favor, elige una votación válida.`;
                return handlerInput.responseBuilder
                    .speak(message)
                    .reprompt('Por favor, menciona una votación válida.')
                    .getResponse();
            }
            
            // Obtenemos las opciones las cuales están unidas a ese título de votación
            const parametrosConsultaOpciones = {
                TableName: 'opciones_votacion_table',
                KeyConditionExpression: 'nombre_votacion = :nombreVotacion',
                ExpressionAttributeValues: {
                    ':nombreVotacion': { S: nombreVotacion }
                },
                IndexName: 'nombre_votacion-index' // Especificar el nombre del GSI que queremos utilizar
            };

            // Ejecutamos la consulta
            const resultQueryOpciones = await dynamoDB.query(parametrosConsultaOpciones).promise();
            
            if (resultQueryOpciones.Items.length > 0) {
                
                // Iterar sobre las opciones y eliminar cada una de ellas
                for (const opcion of resultQueryOpciones.Items) {
                
                    const parametrosEliminarOpcion = {
                        TableName: 'opciones_votacion_table',
                        Key: {
                            'id_opcion': opcion.id_opcion
                        }
                    };
                    // Ejecutamos la eliminación de la opción
                    await dynamoDB.deleteItem(parametrosEliminarOpcion).promise();
                    
                }
                
            }
            
            const parametrosEliminarVotacion = {
                TableName: 'votaciones_table',
                Key: {
                    'nombre_votacion': { S: nombreVotacion }
                }
            };
                
            // Ejecutamos la eliminación de la votación
            await dynamoDB.deleteItem(parametrosEliminarVotacion).promise();
        
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(DOCUMENT_INICIO, datasourceInicio);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
            }
        } catch (error) {
            speechText += 'Hubo un problema al eliminar la votación';
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
        
        speechText += "La votación fue eliminada correctamente"        
        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Manejador para la intención EleccionVotacionAsignaturaIntent.
 *              Este manejador se activa cuando el usuario elige una opción de votación para una asignatura específica.
 *              Actualiza el recuento de votos para la opción seleccionada al registrar la votación del usuario y muestra los resultados a éste
 * 
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @returns {object} - Devuelve una respuesta que confirma la votación del usuario y proporciona instrucciones adicionales.
 */
const EleccionVotacionAsignaturaIntentHandler = {
    canHandle(handlerInput) {
        const { attributesManager } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        // Verificar si LanzarEncuestaIntent se ha ejecutado antes
        return sessionAttributes.votacionEncuesta === true && 
            sessionAttributes.votacionEncuesta2 === true && 
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'EleccionVotacionAsignaturaIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;

        const userId = handlerInput.requestEnvelope.session.user.userId;
        const opcion = intent.slots.opcion_examen.value;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        
        let message = '';
            
        try {
            
            // Asume el rol de AWS mediante la acción STS
            const STS = new AWS.STS({ apiVersion: '2011-06-15' });
            const credentials = await STS.assumeRole({
                RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
                RoleSessionName: 'VoteUGR' 
            }).promise();
    
            // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
            const dynamoDB = new AWS.DynamoDB({
                apiVersion: '2012-08-10',
                accessKeyId: credentials.Credentials.AccessKeyId,
                secretAccessKey: credentials.Credentials.SecretAccessKey,
                sessionToken: credentials.Credentials.SessionToken
            });
            
            // Almacenamos el evento con sus propiedades correspondientes
            const parametrosRegistro = {
                TableName: 'registros_table',
                Item: {
                    'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                    'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                    'activity_name': { S: activityname.toString() },
                    'resource': { S: userId },
                    'user_response': { S: opcion }
                }
            };
    
            // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
            await dynamoDB.putItem(parametrosRegistro).promise();
            
            // Obtenemos la fila de la opcion elegida en opciones_votacion_table, para comprobar que realmente existe la opcion dada por voz
            const parametrosConsultaOpcion = {
                TableName: 'opciones_votacion_table',
                IndexName: 'opcion-index', // Nombre del índice secundario que te permite buscar el elemento por 'opcion'
                KeyConditionExpression: 'opcion = :opcion', // Condición para buscar por 'opcion'
                ExpressionAttributeValues: {
                    ':opcion': { S: opcion } // Valor de 'opcion' que estás buscando
                }
            };
    
            try {
                //Realizamos la consulta, la cual almacenamos en resultQuery
                const resultQuery = await dynamoDB.query(parametrosConsultaOpcion).promise();
    
                //Si se encuentra la opcion 
                if (resultQuery.Items.length > 0) {
                        
                    // Obtener el ID de usuario de la sesión
                    const userId = handlerInput.requestEnvelope.session.user.userId;
                
                    // Se encontró el elemento, utiliza la clave primaria del resultado para actualizar
                    const primaryKey = resultQuery.Items[0].id_opcion.N; 
                        
                    // Consulta para obtener todas las votaciones del usuario
                    const parametrosConsultaVotacionesUsuarios = {
                        TableName: 'votaciones_usuario_table',
                        KeyConditionExpression: 'id_usuario = :userId',
                        ExpressionAttributeValues: {
                            ':userId': { S: userId }
                        }
                    };

                    // Ejecutar la consulta
                    const resultUserVotes = await dynamoDB.query(parametrosConsultaVotacionesUsuarios).promise();

                    // Verificar si el usuario ya ha votado anteriormente en la votación seleccionada
                    const votacionPrevia = resultUserVotes.Items.find(vote => vote.nombre_votacion.S === sessionAttributes['votacionseleccionada']);

                    // Si el usuario ha votado anteriormente en esta votación, eliminar su voto anterior
                    if (votacionPrevia) {
                        const opcionPrevia = votacionPrevia.id_opcion.N;

                        // Consulta para obtener la opción anteriormente votada
                        const paramsGetPreviousOption = {
                            TableName: 'opciones_votacion_table',
                            Key: {
                                'id_opcion': { N: opcionPrevia }
                            }
                        };

                        // Obtener la opción anteriormente votada
                        const resultPreviousOption = await dynamoDB.getItem(paramsGetPreviousOption).promise();

                        // Verificar si se encontró la opción anteriormente votada
                        if (resultPreviousOption.Item) {
                            // Decrementar el conteo de votos de la opción anteriormente votada
                            const parametrosDecrementarVoto = {
                                TableName: 'opciones_votacion_table',
                                Key: {
                                    'id_opcion': { N: opcionPrevia }
                                },
                                UpdateExpression: 'SET conteo_votos = conteo_votos - :decrement',
                                ExpressionAttributeValues: {
                                    ':decrement': { N: '1' }
                                }
                            };

                            // Ejecutar la actualización
                            await dynamoDB.updateItem(parametrosDecrementarVoto).promise();
                                
                            //Eliminamos el registro de la anterior votacion
                            const parametrosEliminarRegistroVoto = {
                                TableName: 'votaciones_usuario_table',
                                Key: {
                                    'id_usuario': { S: userId },
                                    'id_opcion': { N: opcionPrevia }
                                }
                            };

                            // Ejecutamos la eliminación del registro del voto anterior del usuario
                            await dynamoDB.deleteItem(parametrosEliminarRegistroVoto).promise();
                                
                            console.log('Voto anterior del usuario eliminado con éxito.');
                        } 
                    }
                        
                    // Registrar el nuevo voto del usuario en la tabla votaciones_usuario_table
                    const parametrosRegistroVotoNuevo = {
                        TableName: 'votaciones_usuario_table',
                        Item: {
                            'id_usuario': { S: userId },
                            'id_opcion': { N: primaryKey }, // ID de la opción seleccionada
                            'nombre_votacion': { S: sessionAttributes['votacionseleccionada'] } 
                        }
                    };

                    // Ejecutar el registro
                    await dynamoDB.putItem(parametrosRegistroVotoNuevo).promise();
                    
                    // Modificamos el conteo de votos de la opcion elegida, aumentando en 1 el conteo_votos
                    const parametrosIncrementarVoto = {
                        TableName: 'opciones_votacion_table',
                        Key: {
                            'id_opcion': { N: primaryKey }
                        },
                        UpdateExpression: 'SET conteo_votos = conteo_votos + :increment', 
                        ExpressionAttributeValues: {
                            ':increment': { N: '1' },
                        }
                    };
    
                    const resultUpdate = await dynamoDB.updateItem(parametrosIncrementarVoto).promise();
                    console.log('Actualización exitosa:', resultUpdate);
                
                } else {
                    
                    console.log('La opción no existe en la tabla.');
                    return handlerInput.responseBuilder
                        .speak('La opción no existe en la tabla.')
                        .getResponse();
                }
            } catch (error) {
                console.error('Error al obtener la opción de la tabla:', error);
                return handlerInput.responseBuilder
                    .speak('Error al obtener la opción de la tabla.')
                    .getResponse();
            }
                
            // Obtenemos todas las opciones de la votación elegida para mostrar los resultados al realizar la votación
            const paramentrosConsultaOpciones = {
                TableName: 'opciones_votacion_table',
                KeyConditionExpression: 'nombre_votacion = :nombreVotacion',
                ExpressionAttributeValues: {
                    ':nombreVotacion': { S: sessionAttributes['votacionseleccionada'] }
                },
                IndexName: 'nombre_votacion-index' // Especificar el nombre del GSI que queremos utilizar
            };

            // Ejecutamos la consulta y creamos arrays para el posterior multimodal response
            const resultQueryOpciones = await dynamoDB.query(paramentrosConsultaOpciones).promise();
            let opcionVotacionValues = [];
            let primaryTextArray = [];
            let imageSourceArray = [];
            let indexcolor = 0;
            
            //Mostramos al usuario el resultado de las votaciones tras nuestro voto
            if (resultQueryOpciones.Items.length > 0) {
                resultQueryOpciones.Items.forEach((item, index) => {
                    const opcion = item.opcion.S;
                    const conteoVotos = item.conteo_votos.N; 
                    message += ` Opción ${index + 1}: ${opcion}. Total de votos: ${conteoVotos}.`;
                    let messageopcion = ` ${opcion}. Votos: ${conteoVotos}.`; 
                    opcionVotacionValues.push(messageopcion);
                });
            } 
            
            //Almacenamos los valores en los arrays para el posterior multimodal response
            if (opcionVotacionValues.length > 0) {
                opcionVotacionValues.forEach((nombreVotacion, index) => {
                    primaryTextArray.push(nombreVotacion);
                    const indexcolor = index >= 4 ? index - 4 : index;
                    imageSourceArray.push(colores[indexcolor]);
                });
            }

            const opcionesAbiertas = primaryTextArray.map((primaryText, index) => ({
                primaryText,
                imageSource: imageSourceArray[index]
            }));

            // Crear el objeto de datos para la lista de opciones
            const datasourceVotacionesAbiertas = {
                "imageListData": {
                "type": "object",
                "objectId": "imageListSample",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "https://i.ibb.co/KqKgpRW/Fondo.jpg",
                            "size": "large"
                        }
                    ]
                },
                "listItems": opcionesAbiertas.map(opcion => ({
                    "primaryText": opcion.primaryText,
                    "imageSource": opcion.imageSource
                })),
                "logoUrl": "",
                "hintText": "Intenta: \"Quiero ver las votaciones abiertas\""
            }
            };

            // Si el dispositivo es compatible con la interfaz de presentación APL
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                // Generar la directiva APL RenderDocument
                const aplDirective = createDirectivePayload(DOCUMENT_VOTACIONESABIERTAS, datasourceVotacionesAbiertas);
                // Agregar la directiva al Echo con pantalla
                handlerInput.responseBuilder.addDirective(aplDirective);
            }

        } catch (error) {
            console.error('Error al procesar la votación:', error);
            return handlerInput.responseBuilder
                .speak('Hubo un problema al procesar tu voto.')
                .getResponse();
        }
        
        const speechText = requestAttributes.t('INTRORESULTVOTING_MSG', opcion);
        
        // Devuelve el mensaje
        return handlerInput.responseBuilder
            .speak(speechText + message)
            .reprompt(requestAttributes.t('ERROR_MSG'))
            .getResponse();
    }
};

/**
 * @description Este manejador se activa cuando el usuario solicita recordar opciones durante la interacción.
 *              Responde con un mensaje de recordatorio y proporciona una reprompt con el mismo mensaje.
 */
const RecordarOpcionesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordarOpcionesIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        
        const speechText = requestAttributes.t('REMEMBER_MSG');
        
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const activityname = Alexa.getIntentName(handlerInput.requestEnvelope);
        const userresponse = intent.slots.recordar_opciones.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        // Asume el rol de AWS mediante la acción STS
        const STS = new AWS.STS({ apiVersion: '2011-06-15' });
        const credentials = await STS.assumeRole({
            RoleArn: 'arn:aws:iam::590183737978:role/AccesoTotalDynamoDB',
            RoleSessionName: 'VoteUGR' 
        }).promise();
    
        // Crea una nueva instancia de dynamoDB con el rol de AWS obtenido antes
        const dynamoDB = new AWS.DynamoDB({
            apiVersion: '2012-08-10',
            accessKeyId: credentials.Credentials.AccessKeyId,
            secretAccessKey: credentials.Credentials.SecretAccessKey,
            sessionToken: credentials.Credentials.SessionToken
        });
    
        // Almacenamos el evento con sus propiedades correspondientes
        const parametrosRegistro = {
            TableName: 'registros_table',
            Item: {
                'timestamp': { S: new Date().toISOString() }, // Convertir la fecha a formato ISO string si es necesario
                'case_id': { N: sessionAttributes.contador.toString() }, // Asegurarse de que sessionAttributes.contador es un número y convertirlo a cadena
                'activity_name': { S: activityname.toString() },
                'resource': { S: userId },
                'user_response': { S: userresponse }
            }
        };

        // Ejecutamos la operación putItem para ingresar un nuevo item a la tabla
        await dynamoDB.putItem(parametrosRegistro).promise();
            
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/************************************ FIN HANDLERS PRINCIPALES ************************************/

/************************************ INICIO MANEJADOR CONTROLADORES E INTERCEPTORS ************************************/

/**
 * Este controlador actúa como el punto de entrada para tu habilidad, dirigiendo todos los
 * paquetes de solicitud y respuesta a los controladores anteriores.
 * Todos los controladores e interceptores tienen que estar declarados aquí
 * El orden es importante: se procesan de arriba a abajo.
 */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        LanzarEncuestaIntentHandler,
        ElegirTitulacionEncuestaIntentHandler,
        ElegirAsignaturaInformaticaIntentHandler,
        ElegirAsignaturaTelecoIntentHandler,
        CrearTituloEncuestaIntentHandler,
        CrearOpcionesEncuestaIntentHandler,
        InscribirAsignaturaIntentHandler,
        ElegirTitulacionInscripcionIntentHandler,
        InscripcionAsignaturaInformaticaIntentHandler,
        InscripcionAsignaturaTelecoIntentHandler,
        VerVotacionesAbiertasIntentHandler,
        EliminarEncuestaIntentHandler,
        VotarAsignaturaIntentHandler,
        EliminarVotacionesDefinitivoIntentHandler,
        EleccionVotacionAsignaturaIntentHandler,
        RecordarOpcionesIntentHandler,
        HelpIntentHandler,
        CancelIntentHandler,
        StopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalizationRequestInterceptor,
        LoggingRequestInterceptor,
        LoadAttributesRequestInterceptor)
    .addResponseInterceptors(
        LoggingResponseInterceptor,
        SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
    
/************************************ FIN MANEJADOR CONTROLADORES E INTERCEPTORS ************************************/