// src/components/ProductCard.js
import React from 'react';
import { labelCategorie, formatPgVg } from '../constants/categories';
import '../styles/productMeta.css';

export default function ProductCard({ product, onDelete, onEdit }) {
  const hasPg = product.pg !== null && product.pg !== undefined && product.pg !== '';

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-manufacturer">Fabricant: {product.manufacturer}</p>

        {/* Catégorie et ratio PG/VG. Chaque élément ne s'affiche que
            s'il est renseigné : les produits pas encore complétés
            gardent une fiche propre. */}
        {(product.category || hasPg) && (
          <div className="product-meta">
            {product.category && (
              <span className={`product-category product-category--${product.category}`}>
                {labelCategorie(product.category)}
              </span>
            )}
            {hasPg && (
              <span className="product-ratio" title="Ratio Propylène Glycol / Glycérine Végétale">
                PG/VG {formatPgVg(product.pg)}
              </span>
            )}
          </div>
        )}

        <div className="product-flavors">
          <p className="flavors-label">Saveurs:</p>
          <div className="flavors-list">
            {product.flavors && product.flavors.length > 0 ? (
              product.flavors.map((flavor, index) => (
                <span key={index} className="flavor-badge">
                  {flavor}
                </span>
              ))
            ) : (
              <span>Aucune saveur</span>
            )}
          </div>
        </div>
      </div>

      {(onDelete || onEdit) && (
        <div className="product-actions">
          {onEdit && (
            <button
              className="edit-button"
              onClick={() => onEdit(product.id)}
              type="button"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              className="delete-button"
              onClick={() => onDelete(product.id)}
              type="button"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
