import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente realizado en React que representa el encabezado de la aplicación.
 *
 * @example Para utilizar el componente, inclúyelo de la siguiente manera: <Header />
 *
 * @description Se muestra el encabezado de la aplicación, así como el logo
 *              de la Universidad de Granada (UGR) y el título de la aplicación.
 *              El logo, al clicar, lleva a la página principal.
 *
 */
const Header = () => {
    return (
        <header className="header">
            <Link to="/">
                <img src="/images/ugrlogo.jpg" alt="UGR Logo" className="logo" />
            </Link>
            <h1 className="titulo-header">Extract Logs - Process Mining</h1>
        </header>
    );
}

export default Header;