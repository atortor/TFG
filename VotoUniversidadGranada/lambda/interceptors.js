// Dependencias de i18n. i18n es el módulo principal, sprintf nos permite incluir variables con '%s'.
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

// Importamos un objeto de cadenas de idioma que contiene todas las cadenas necesarias para el funcionamiento de la skill
// Según el idioma, será elegida un conjunto u otro, los cuales están guardados en localization
const languageStrings = require('./localization');

/************************************ INICIO INTERCEPTORS ************************************/

/**
 * @description Este interceptor de solicitud registra todas las solicitudes entrantes a esta lambda.
 * @function process
 * @summary Registra la solicitud entrante.
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 */
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    }
};

/**
 * @description Este interceptor de solicitud registra todas las solicitudes salientes a esta lambda.
 * @function process
 * @summary Registra la solicitud saliente
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @param {object} response - La respuesta que se envía al usuario.
 */
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
      console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

/**
 * @description Este interceptor de solicitud vincula una función de traducción 't' a los atributos de solicitud.
 * @function process
 * @summary Vincula la función de traducción 't' a los atributos de solicitud.
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 */
const LocalizationRequestInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    });
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    }
  }
};

/**
 * @description Este interceptor de solicitud carga los atributos de sesión persistentes en los atributos de sesión al comenzar una nueva sesión.
 * @function process
 * @summary Carga los atributos de sesión persistentes al iniciar una nueva sesión.
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 */
const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        if(handlerInput.requestEnvelope.session['new']){ //is this a new session?
            const {attributesManager} = handlerInput;
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            //copy persistent attribute to session attributes
            handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

/**
 * @description Este interceptor de respuesta guarda los atributos de sesión en los atributos persistentes al finalizar la sesión.
 * @function process
 * @summary Guarda los atributos de sesión en los atributos persistentes al finalizar la sesión.
 * @param {object} handlerInput - El objeto que contiene la solicitud manejada.
 * @param {object} response - La respuesta que se envía al usuario.
 */
const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession);//is this a session end?
        if(shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out            
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
        }
    }
};

/************************************ FIN INTERCEPTORS ************************************/

module.exports = {
    LoggingRequestInterceptor,
    LoggingResponseInterceptor,
    LocalizationRequestInterceptor,
    LoadAttributesRequestInterceptor,
    SaveAttributesResponseInterceptor
};