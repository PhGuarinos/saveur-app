// src/firebase/firestoreService.js
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
 } from 'firebase/firestore';
import { db } from './config';

const PRODUCTS_COLLECTION = 'products';

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
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name: product.name,
      manufacturer: product.manufacturer,
      flavors: product.flavors || [],
      image: product.image || '/images/placeholder.jpg',
      createdAt: new Date()
    });
    return {
      id: docRef.id,
      ...product
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit:', error);
    throw error;
  }
};

export const updateProduct = async (productId, updatedProduct) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      name: updatedProduct.name,
      manufacturer: updatedProduct.manufacturer,
      flavors: updatedProduct.flavors || [],
      image: updatedProduct.image || '/images/placeholder.jpg',
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
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
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
        name: product.name,
        manufacturer: product.manufacturer,
        flavors: product.flavors || [],
        image: product.image || '/images/placeholder.jpg',
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