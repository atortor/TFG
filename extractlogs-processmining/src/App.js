import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import observarLogs from './utils/observarLogs';
import extraerLogsFiltrados from './utils/extraerLogsFiltrados';
import Main from './components/Main';
import Logs from './components/Logs';
import LogsFiltrados from './components/LogsFiltrados';
import Extract from './components/Extract';
import Contacto from './components/Contacto';
import Token from './components/Token';
import './App.css';

/**
 * Archivo principal de la aplicación que gestiona la navegación y el estado global.
 *
 * @description Este componente utiliza React Router para gestionar la navegación entre diferentes rutas de la aplicación.
 *              También mantiene el estado global para el nombre del proyecto, el token de acceso, los logs y las interacciones.
 *              Proporciona funciones para obtener logs y las interacciones, que se pasan como parámetros a los componentes hijos.
 *
 */
function App() {
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [tokenAcceso, setTokenAcceso] = useState('');
    const [logs, setLogs] = useState(null);
    const [logsFiltrados, setLogsFiltrados] = useState(null);

    /**
     * Función para obtener los logs del proyecto utilizando el nombre del proyecto y el token de acceso.
     *
     * @param {string} nombreProyecto - Nombre del proyecto en DialogFlow.
     * @param {string} tokenAcceso - Token de acceso para la API de Google Cloud.
     */
    const obtenerLogs = async (nombreProyecto, tokenAcceso) => {
        await observarLogs(nombreProyecto, tokenAcceso, setLogs);
    }

    /**
     * Función para obtener los logs filtrados.
     */
    const obtenerLogsFiltrados = async () => {
        await extraerLogsFiltrados(setLogsFiltrados);
    };

    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/"
                           element={
                               <Main
                                   setNombreProyecto={setNombreProyecto}
                                   setTokenAcceso={setTokenAcceso}
                                   obtenerLogs={obtenerLogs}
                                   obtenerLogsFiltrados={obtenerLogsFiltrados}
                               />
                           }
                    />
                    <Route path="/logs" element={<Logs logs={logs} />} />
                    <Route path="/logs-filtrados" element={<LogsFiltrados logs={logsFiltrados} />} />
                    <Route path="/extract" element={<Extract />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/token" element={<Token />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;