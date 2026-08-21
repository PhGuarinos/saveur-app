// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import AddProductForm from './components/AddProductForm';
import ImportCSVForm from './components/ImportCSVForm';
import ImportExportData from './components/ImportExportData';
import LoginModal from './components/LoginModal';
import { normalizeString } from './utils/stringUtils';
import { TOUS, A_COMPLETER, estACompleter } from './constants/categories';
import './styles/styles.css';

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  migrateFromLocalStorage
} from './firebase/firestoreService';

function App() {
  const [products, setProducts] = useState([]);
  const [searchFlavor, setSearchFlavor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(TOUS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      alert('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 1 : filtrage par la recherche texte (saveurs, nom, fabricant).
  // Les accès aux champs sont sécurisés : un produit importé peut avoir
  // un champ manquant, ce qui faisait planter la recherche avant.
  const searchedProducts = useMemo(() => {
    if (!searchFlavor) return products;

    const normalizedSearch = normalizeString(searchFlavor.toLowerCase());

    return products.filter((product) => {
      const flavors = Array.isArray(product.flavors) ? product.flavors : [];
      const matchesFlavorSearch = flavors.some((flavor) =>
        normalizeString(String(flavor).toLowerCase()).includes(normalizedSearch)
      );

      const matchesNameSearch = normalizeString(
        String(product.name || '').toLowerCase()
      ).includes(normalizedSearch);

      const matchesManufacturerSearch = normalizeString(
        String(product.manufacturer || '').toLowerCase()
      ).includes(normalizedSearch);

      return matchesFlavorSearch || matchesNameSearch || matchesManufacturerSearch;
    });
  }, [products, searchFlavor]);

  // ÉTAPE 2 : filtrage par catégorie, appliqué par-dessus la recherche.
  const filteredProducts = useMemo(() => {
    if (selectedCategory === TOUS) return searchedProducts;
    if (selectedCategory === A_COMPLETER) return searchedProducts.filter(estACompleter);
    return searchedProducts.filter((product) => product.category === selectedCategory);
  }, [searchedProducts, selectedCategory]);

  const handleSearch = (flavor) => {
    setSearchFlavor(flavor);
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct);
      setProducts([...products, addedProduct]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    if (!updatedProduct) {
      setEditingProduct(null);
      setShowAddForm(false);
      return;
    }

    try {
      await updateProduct(updatedProduct.id, updatedProduct);

      const updatedProducts = products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      );

      setProducts(updatedProducts);
      setEditingProduct(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      alert('Erreur lors de la mise à jour du produit');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(productId);

        const updatedProducts = products.filter(product => product.id !== productId);
        setProducts(updatedProducts);
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleDeleteAllProducts = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les produits ?')) {
      try {
        await deleteAllProducts();
        setProducts([]);
      } catch (error) {
        console.error('Erreur lors de la suppression de tous les produits:', error);
        alert('Erreur lors de la suppression de tous les produits');
      }
    }
  };

  const handleEditProduct = (productId) => {
    const productToEdit = products.find(product => product.id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setShowAddForm(true);
      setShowImportForm(false);

      // Scroll automatiquement vers le haut
      window.scrollTo(0, 0);
    }
  };

  const handleImportProducts = async (importedProducts) => {
    if (!importedProducts || importedProducts.length === 0) return;

    try {
      const addPromises = importedProducts.map(product => addProduct(product));
      const addedProducts = await Promise.all(addPromises);

      alert(`${addedProducts.length} produits importés avec succès !`);

      setShowImportForm(false);
      setSearchFlavor('');
      setSelectedCategory(TOUS);

      setTimeout(() => {
        loadProducts();
      }, 500);

    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      alert('Erreur lors de l\'importation des produits');
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setEditingProduct(null);
    setShowImportForm(false);
  };

  const toggleImportForm = () => {
    setShowImportForm(!showImportForm);
    setShowAddForm(false);
  };

  const handleReturnHome = () => {
    setShowAddForm(false);
    setShowImportForm(false);
    setEditingProduct(null);
    setSearchFlavor('');
    setSelectedCategory(TOUS);
  };

  const handleMigrateData = async () => {
    if (window.confirm('Voulez-vous migrer vos données du localStorage vers Firebase ?')) {
      try {
        const count = await migrateFromLocalStorage();
        alert(`Migration réussie ! ${count} produits migrés.`);
        loadProducts();
      } catch (error) {
        console.error('Erreur lors de la migration:', error);
        alert('Erreur lors de la migration des données');
      }
    }
  };

  // Page de login si pas d'utilisateur connecté
  if (!userRole) {
    return <LoginModal onLogin={setUserRole} />;
  }

  // Page de chargement
  if (loading) {
    return (
      <div className="app">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Page principale
  return (
    <div className="app">
      <Header
        onReturnHome={showAddForm || showImportForm ? handleReturnHome : null}
        userRole={userRole}
        onLogout={() => setUserRole(null)}
      />

      <div className="app-controls">
        <SearchBar onSearch={handleSearch} />

        {/* FILTRE PAR CATÉGORIE - VISIBLE POUR TOUS */}
        <CategoryFilter
          products={searchedProducts}
          value={selectedCategory}
          onChange={setSelectedCategory}
          showToFill={userRole === 'admin'}
        />

        {/* BOUTONS ADMIN SEULEMENT */}
        {userRole === 'admin' && (
          <div className="button-group">
            <button
              className="add-button"
              onClick={toggleAddForm}
              type="button"
            >
              {showAddForm ? 'Annuler' : (editingProduct ? 'Annuler l\'édition' : 'Ajouter un produit')}
            </button>
            <button
              className="import-button"
              onClick={toggleImportForm}
              type="button"
            >
              {showImportForm ? 'Annuler' : 'Importer CSV'}
            </button>
            {products.length > 0 && (
              <button
                className="delete-all-button"
                onClick={handleDeleteAllProducts}
                type="button"
              >
                Supprimer tout
              </button>
            )}
            <button
              className="migrate-button"
              onClick={handleMigrateData}
              type="button"
              title="Migrer les données du localStorage vers Firebase"
            >
              Migrer localStorage
            </button>
          </div>
        )}
      </div>

      {/* IMPORT/EXPORT ADMIN SEULEMENT */}
      {userRole === 'admin' && (
        <ImportExportData
          products={products}
          onImport={handleImportProducts}
        />
      )}

      {/* FORMULAIRES ADMIN SEULEMENT */}
      {userRole === 'admin' && showAddForm && (
        <AddProductForm
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          productToEdit={editingProduct}
        />
      )}

      {userRole === 'admin' && showImportForm && (
        <ImportCSVForm onImportProducts={handleImportProducts} />
      )}

      {/* LISTE PRODUITS VISIBLE POUR TOUS */}
      <ProductList
        products={filteredProducts}
        onDeleteProduct={userRole === 'admin' ? handleDeleteProduct : null}
        onEditProduct={userRole === 'admin' ? handleEditProduct : null}
        searchTerm={searchFlavor}
      />
    </div>
  );
}

export default App;
