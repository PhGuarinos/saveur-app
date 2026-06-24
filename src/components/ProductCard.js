// src/components/ProductCard.js
import React from 'react';

export default function ProductCard({ product, onDelete, onEdit }) {
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