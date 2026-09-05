// src/firebase/firestoreService.js
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './config';

const PRODUCTS_COLLECTION = 'products';

// Construit l'objet envoyé à Firestore à partir d'un produit.
// Centralisé ici : ajouter un champ au catalogue ne demandera plus
// que de modifier cette seule fonction, au lieu de trois.
const toFirestoreProduct = (product) => ({
  name: product.name,
  manufacturer: product.manufacturer,
  flavors: product.flavors || [],
  // category et pg valent null tant qu'ils ne sont pas renseignés.
  // Attention : pg peut légitimement valoir 0 (100% VG), donc on teste
  // explicitement null/undefined plutôt que d'utiliser ||.
  category: product.category || null,
  pg: product.pg === null || product.pg === undefined || product.pg === ''
    ? null
    : Number(product.pg),
  image: product.image || '/images/placeholder.jpg'
});

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

export const addProduct = async (product) => {
  try {
    const data = toFirestoreProduct(product);
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...data,
      createdAt: new Date()
    });
    // On renvoie les données réellement écrites, pas le produit d'origine :
    // sinon l'affichage pouvait montrer autre chose que ce qui est en base.
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit:', error);
    throw error;
  }
};

export const updateProduct = async (productId, updatedProduct) => {
  try {
    const id = String(productId);
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...toFirestoreProduct(updatedProduct),
      updatedAt: new Date()
    });
    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const id = String(productId);
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

export const deleteAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Erreur lors de la suppression de tous les produits:', error);
    throw error;
  }
};

export const migrateFromLocalStorage = async () => {
  try {
    const localData = localStorage.getItem('products');
    if (!localData) {
      alert('Aucune donnée trouvée dans le localStorage');
      return 0;
    }
    const products = JSON.parse(localData);
    let count = 0;
    for (const product of products) {
      await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...toFirestoreProduct(product),
        createdAt: new Date()
      });
      count++;
    }
    return count;
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
};
