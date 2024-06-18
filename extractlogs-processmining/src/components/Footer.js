import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente realizado en React que representa el pie de página de la aplicación.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Footer />
 *
 * @description Se muestra el pie de página de la aplicación, incluyendo enlaces a páginas
 *              como aquella que enseña cómo obtener el token de acceso y la página de contacto.
 *              También incluye un título indicando que se trata de un Trabajo de Fin de Grado
 *
 */
const Footer = () => {
    return (
        <footer className="footer">
            <Link to="/token" className="enlace-footer">¿Cómo obtener token de acceso?</Link>
            <p className="titulo-footer">Trabajo de Fin de Grado</p>
            <Link to="/contacto" className="enlace-footer">Contacto</Link>
        </footer>
    );
}

export default Footer;