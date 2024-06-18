import axios from 'axios';

const observarLogs = async (projectName, accessToken, setLogs) => {
    try {
        const response = await axios.post('http://localhost:5000/logs', {
            projectName,
            accessToken
        });
        setLogs(response.data);
    } catch (error) {
        console.error(`Error fetching logs: ${error}`);
    }
};

export default observarLogs;