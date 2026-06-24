// src/components/ProductList.js
import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, onDeleteProduct, onEditProduct, searchTerm }) {
  if (products.length === 0) {
    return (
      <div className="product-list">
        <p className="no-products">
          {searchTerm ? 'Aucun produit trouvé avec ces critères de recherche.' : 'Aucun produit disponible.'}
        </p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={onDeleteProduct}
          onEdit={onEditProduct}
        />
      ))}
    </div>
  );
}