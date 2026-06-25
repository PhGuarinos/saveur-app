// src/components/AddProductForm.js
import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { cleanAndFormat } from '../utils/stringUtils';

export default function AddProductForm({ onAddProduct, onUpdateProduct, productToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    flavors: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Créer un nom unique pour l'image
      const timestamp = Date.now();
      const filename = `products/${timestamp}_${file.name}`;
      
      // Upload vers Firebase Storage
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      
      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);
      
      // Mettre à jour le formulaire avec l'URL
      setFormData(prev => ({
        ...prev,
        image: downloadURL
      }));
      
      setImageFile(file);
      alert('✅ Image uploadée avec succès !');
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('❌ Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
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
    setImageFile(null);
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
          <label htmlFor="image-file">📸 Choisir une image *</label>
          <input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
          />
          {uploading && <small>⏳ Upload en cours...</small>}
          {imageFile && <small>✅ Image sélectionnée: {imageFile.name}</small>}
          {formData.image && !uploading && <small>✅ Image uploadée!</small>}
        </div>

        <div className="form-buttons">
          <button 
            type="submit" 
            className="confirm-button"
            disabled={uploading}
          >
            {uploading ? '⏳ Upload...' : (productToEdit ? 'Mettre à jour' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
}