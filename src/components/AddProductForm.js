// src/components/AddProductForm.js
import React, { useState, useEffect } from 'react';
import { cleanAndFormat } from '../utils/stringUtils';

export default function AddProductForm({ onAddProduct, onUpdateProduct, productToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    flavors: '',
    image: ''
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        manufacturer: productToEdit.manufacturer || '',
        flavors: Array.isArray(productToEdit.flavors) 
          ? productToEdit.flavors.join(', ')
          : (productToEdit.flavors || ''),
        image: productToEdit.image || ''
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.manufacturer.trim() || !formData.flavors.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    let flavorsArray = [];
    
    if (Array.isArray(formData.flavors)) {
      flavorsArray = formData.flavors
        .map(flavor => cleanAndFormat(flavor))
        .filter(flavor => flavor !== '');
    } else if (typeof formData.flavors === 'string') {
      flavorsArray = formData.flavors
        .split(',')
        .map(flavor => cleanAndFormat(flavor))
        .filter(flavor => flavor !== '');
    }

    if (flavorsArray.length === 0) {
      alert('Veuillez entrer au moins une saveur');
      return;
    }

    const product = {
      id: productToEdit?.id,
      name: cleanAndFormat(formData.name),
      manufacturer: cleanAndFormat(formData.manufacturer),
      flavors: flavorsArray,
      image: formData.image || '/images/placeholder.jpg'
    };

    if (productToEdit) {
      onUpdateProduct(product);
    } else {
      onAddProduct(product);
    }

    setFormData({
      name: '',
      manufacturer: '',
      flavors: '',
      image: ''
    });
  };

  return (
    <div className="add-product-form">
      <h3>{productToEdit ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du produit *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Saveur Mystérieuse"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="manufacturer">Fabricant *</label>
          <input
            id="manufacturer"
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder="Ex: Marque Premium"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="flavors">Saveurs (séparées par des virgules) *</label>
          <textarea
            id="flavors"
            name="flavors"
            value={formData.flavors}
            onChange={handleChange}
            placeholder="Ex: Fraise, Vanille, Chocolat"
            rows="3"
            required
          />
          <small>Les caractères accentués sont supportés</small>
        </div>

        <div className="form-group">
          <label htmlFor="image">URL de l'image</label>
          <input
            id="image"
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Ex: /images/product_1.jpg"
          />
          <small>Laissez vide pour utiliser l'image par défaut</small>
        </div>

        <div className="form-buttons">
          <button type="submit" className="confirm-button">
            {productToEdit ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}