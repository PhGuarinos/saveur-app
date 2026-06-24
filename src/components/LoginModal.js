// src/components/LoginModal.js
import React, { useState } from 'react';

export default function LoginModal({ onLogin }) {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const adminPassword = 'admin123';

  const handleVendeurLogin = () => {
    onLogin('vendeur');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    if (password === adminPassword) {
      onLogin('admin');
      setPassword('');
      setError('');
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <h2>Catalogue de Produits par Saveur</h2>
        <p className="login-subtitle">Choisissez votre mode d'accès</p>

        {!showAdminForm ? (
          <div className="login-buttons">
            <button 
              className="login-button vendeur-button"
              onClick={handleVendeurLogin}
              type="button"
            >
              👁️ Accès Vendeur
              <span className="login-subtitle-small">Consultation uniquement</span>
            </button>
            
            <button 
              className="login-button admin-button"
              onClick={() => setShowAdminForm(true)}
              type="button"
            >
              🔐 Accès Administrateur
              <span className="login-subtitle-small">Gestion complète</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <label htmlFor="admin-password">Mot de passe administrateur :</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe"
              autoFocus
            />
            
            {error && <div className="login-error">{error}</div>}
            
            <div className="login-form-buttons">
              <button type="submit" className="login-button admin-button">
                Se connecter
              </button>
              <button 
                type="button"
                className="login-button cancel-button"
                onClick={() => {
                  setShowAdminForm(false);
                  setPassword('');
                  setError('');
                }}
              >
                Retour
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}