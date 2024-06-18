const fs = require('fs');

const readData = () => {
    try {
        const data = fs.readFileSync("./logs.json");
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
    }
}

const readDataFiltrado = () => {
    try {
        const data = fs.readFileSync("./logsFiltrados.json");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('El archivo logsFiltrados.json no existe. Creando un archivo nuevo.');
            return { entries: [] }; // Devuelve una estructura de datos vacía
        } else {
            console.error('Error al leer el archivo logsFiltrados.json:', error);
            throw error; // Relanza el error para manejarlo en otro lugar si es necesario
        }
    }
}

const writeDataFiltrado = (dataFiltrado) => {
    try {
        fs.writeFileSync("./logsFiltrados.json", JSON.stringify(dataFiltrado))
    } catch (error) {
        console.log(error);
    }
}

module.exports = {readDataFiltrado, writeDataFiltrado, readData};