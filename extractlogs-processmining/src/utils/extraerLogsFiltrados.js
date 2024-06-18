import axios from 'axios';

const extraerLogsFiltrados = async (setFilteredLogs) => {
    try {
        const response = await axios.get('http://localhost:5000/logs/interactions');
        setFilteredLogs(response.data.entries);
    } catch (error) {
        console.error(`Error fetching filtered logs: ${error}`);
    }
};

export default extraerLogsFiltrados;