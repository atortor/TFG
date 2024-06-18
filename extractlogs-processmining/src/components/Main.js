import React from 'react';
import { useNavigate } from 'react-router-dom';
import descargarCSV from '../utils/descargarCSV';

/**
 * Componente realizado en React que representa la página principal de la aplicación.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera:
 *          <Main
 *              setNombreProyecto={setNombreProyecto}
 *              setTokenAcceso={setTokenAcceso}
 *              obtenerLogs={obtenerLogs}
 *              obtenerLogsFiltrados={obtenerLogsFiltrados}
 *          />
 *
 * @param {Function} setNombreProyecto - Función para establecer el nombre del proyecto.
 * @param {Function} setTokenAcceso - Función para establecer el token de acceso.
 * @param {Function} obtenerLogs - Función para obtener los logs.
 * @param {Function} obtenerLogsFiltrados - Función para obtener los logs filtrados.
 *
 * @description Este componente muestra la página principal con opciones para observar logs en formato JSON,
 *              examinar interacciones en una tabla, y extraer interacciones en formato CSV.
 *              También incluye un formulario para ingresar el nombre del proyecto y el token de acceso,
 *              necesarios para las funcionalidades de obtención de logs e interacciones
 *
 */
const Main = ({ setNombreProyecto, setTokenAcceso, obtenerLogs, obtenerLogsFiltrados }) => {
    const navigate = useNavigate();

    const [nombreProyecto, setLocalNombreProyecto] = React.useState('');
    const [tokenAcceso, setLocalTokenAcceso] = React.useState('');

    const handleButtonClick = async () => {
        await obtenerLogs(nombreProyecto, tokenAcceso);
        navigate('/logs');
    };

    const handleFilteredLogsClick = async () => {
        await obtenerLogsFiltrados();
        navigate('/logs-filtrados');
    };

    const handleExtractLogsClick = async () => {
        await descargarCSV();
        navigate('/extract');
    };

    return (
        <main className="main-content">
            <h2 className="subtitulo">
                App para extracción de interacciones de diálogos en Google Cloud de un Chatbot de Dialogflow
            </h2>
            <div className="content-sections">
                <section className="left-section">
                    <div className="buttons">
                        <button className="action-button" onClick={handleButtonClick}>
                            Observar logs en formato JSON
                        </button>
                        <button className="action-button" onClick={handleFilteredLogsClick}>
                            Examinar interacciones en tabla
                        </button>
                        <button className="action-button" onClick={handleExtractLogsClick}>
                            Extraer interacciones en formato CSV
                        </button>
                    </div>
                </section>
                <section className="right-section">
                    <h3 className="form-instruction">
                        Es necesario rellenar estos campos correctamente para el funcionamiento de las funcionalidades de la izquierda
                    </h3>
                    <form className="form">
                        <div className="form-field">
                            <label htmlFor="project-name">Nombre del proyecto:</label>
                            <input
                                type="text"
                                id="project-name"
                                name="project-name"
                                value={nombreProyecto}
                                onChange={(e) => {
                                    setLocalNombreProyecto(e.target.value);
                                    setNombreProyecto(e.target.value);
                                }}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="access-token">Token de acceso:</label>
                            <textarea
                                id="access-token"
                                name="access-token"
                                rows="5"
                                value={tokenAcceso}
                                onChange={(e) => {
                                    setLocalTokenAcceso(e.target.value);
                                    setTokenAcceso(e.target.value);
                                }}
                            />
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default Main;
