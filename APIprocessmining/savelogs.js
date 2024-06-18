const axios = require('axios');
const fs = require('fs');

const saveLogs = async (projectName, accessToken) => {
    // URL de la API
    const url = "https://logging.googleapis.com/v2/entries:list";

    // Encabezados
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };

    // Cuerpo de la solicitud
    const data = {
        "projectIds": [projectName],
        "filter": `logName="projects/${projectName}/logs/dialogflow_agent"`,
        "pageSize": 1000,
        "orderBy": "timestamp desc"
    };

    try {
        const response = await axios.post(url, data, { headers });
        fs.writeFileSync('logs.json', JSON.stringify(response.data, null, 4));
        console.log("El archivo logs.json ha sido guardado exitosamente.");
    } catch (error) {
        console.error(`Error en la solicitud: ${error.response ? error.response.status : error.message}`);
        if (error.response) {
            console.error(error.response.data);
        }
    }
};

module.exports = saveLogs;