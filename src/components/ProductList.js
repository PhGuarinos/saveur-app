// src/components/ProductList.js
import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({
  products,
  onDeleteProduct,
  onEditProduct,
  searchTerm,
  isCategoryFiltered = false
}) {
  if (products.length === 0) {
    // Un catalogue filtré et un catalogue vide ne sont pas la même chose :
    // le message doit dire laquelle des deux situations on regarde.
    let message = 'Aucun produit disponible.';

    if (searchTerm && isCategoryFiltered) {
      message = 'Aucun produit ne correspond à cette recherche dans cette catégorie. Essayez « Tous ».';
    } else if (searchTerm) {
      message = 'Aucun produit trouvé avec ces critères de recherche.';
    } else if (isCategoryFiltered) {
      message = 'Aucun produit dans cette catégorie. Cliquez sur « Tous » pour voir tout le catalogue.';
    }

    return (
      <div className="product-list">
        <p className="no-products">{message}</p>
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
