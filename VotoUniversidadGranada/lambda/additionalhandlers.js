const Alexa = require('ask-sdk-core'); //para usar la API del Kit de Habilidades de Alexa

/************************************ INICIO HANDLERS AYUDA ************************************/
/**
 * @description Este manejador se activa cuando el usuario solicita ayuda durante la interacción.
 *              Responde con un mensaje de ayuda y proporciona una reprompt con el mismo mensaje.
 */
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/**
 * @description El reflejo de intenciones se utiliza para probar y depurar el modelo de interacción.
 *              Simplemente repetirá la intención que el usuario dijo.
 *              Interesante para saber cuando estamos llamando a un intent del cual su manejador no es ejecutado.
 */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = requestAttributes.t('REFLECTOR_MSG', intentName);

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

/************************************ FIN HANDLERS AYUDA ************************************/

/************************************ INICIO HANDLERS PARADA/CANCELACIÓN SKILL ************************************/

/**
 * @description Este manejador se activa cuando el usuario solicita detener la interacción actual.
 *              Responde con un mensaje de detención.
 */
const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('STOP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

/**
 * @description Este manejador se activa cuando el usuario solicita cancelar la interacción actual.
 *              Responde con un mensaje de cancelación.
 */
const CancelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('CANCEL_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

/**
 * @description SessionEndedRequest notifica que una sesión ha finalizado. Este controlador se activará 
 *              cuando una sesión abierta actualmente se cierre por una de las siguientes razones:
 *                  1) El usuario dice "exit" o "quit". 
 *                  2) El usuario no responde o dice algo que no coincide con una intención definida en su modelo de voz. 
 *                  3) Ocurre un error.
 */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

/************************************ FIN HANDLERS PARADA/CANCELACIÓN SKILL ************************************/

/************************************ INICIO HANDLERS ERROR ************************************/

/**
 * @description Se activa cuando un cliente dice algo que no se asigna a ninguna intención en tu habilidad. 
 *              También debe estar definido en el modelo de idioma (si el idioma lo admite). 
 *              Este controlador se puede agregar de forma segura, pero se ignorará en los idiomas que aún no lo admiten.
 */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/**
 * @description Manejo genérico de errores para capturar cualquier error de sintaxis o 
 *              enrutamiento. Si recibes un error que indica que la cadena de manejo de 
 *              solicitudes no se encuentra, significa que no has implementado un controlador 
 *              para la intención que se está invocando o no lo has incluido en el constructor 
 *              de habilidades a continuación.
 */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speechText = requestAttributes.t('ERROR_MSG');

        console.log(`~~~~ Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/************************************ FIN HANDLERS ERROR ************************************/

module.exports = {
    HelpIntentHandler,
    IntentReflectorHandler,
    StopIntentHandler,
    CancelIntentHandler,
    SessionEndedRequestHandler,
    FallbackIntentHandler,
    ErrorHandler
};