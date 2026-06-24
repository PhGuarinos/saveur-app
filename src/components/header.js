// src/components/Header.js
import React from 'react';

const Header = ({ onReturnHome, userRole, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Catalogue de Produits par Saveur</h1>
        <p>Trouvez facilement des produits selon leurs saveurs</p>

        {userRole && (
          <div className="header-user-info">
            <span className="user-role">
              {userRole === 'admin' ? '🔐 Admin' : '👁️ Vendeur'}
            </span>
            <button 
              className="logout-button"
              onClick={onLogout}
              type="button"
            >
              Déconnexion
            </button>
          </div>
        )}

        {onReturnHome && (
          <button 
            className="home-button"
            onClick={onReturnHome}
            type="button"
          >
            Retour à l'accueil
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;