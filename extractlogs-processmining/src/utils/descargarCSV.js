import axios from 'axios';

const descargarCSV = async () => {
    try {
        // Solicita los datos filtrados e insértalos en la base de datos
        await axios.get('http://localhost:5000/api');

        // Solicita la exportación a CSV y descarga el archivo
        const response = await axios.get('http://localhost:5000/api/export/csv', {
            responseType: 'blob', // Indica que la respuesta es un blob para manejar archivos binarios
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'eventlog.csv'); // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        link.remove(); // Eliminar el enlace después de hacer clic
    } catch (error) {
        console.error('Error al extraer y descargar el CSV:', error);
    }
};

export default descargarCSV;
