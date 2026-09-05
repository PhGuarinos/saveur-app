// src/constants/categories.js

// Les 3 catégories sont mutuellement exclusives : un produit en a une seule.
// - fruitee           : uniquement des saveurs fruitées
// - gourmand          : uniquement des saveurs gourmandes (caramel, vanille, pop-corn...)
// - fruitee_gourmande : un mélange des deux (ex. fraise + vanille)
//
// Les identifiants stockés en base sont sans accent ni espace.
// Les accents restent uniquement à l'affichage (label).
export const CATEGORIES = [
  { id: 'fruitee', label: 'Fruités' },
  { id: 'gourmand', label: 'Gourmands' },
  { id: 'fruitee_gourmande', label: 'Fruités Gourmands' },
];

// Valeurs spéciales du filtre (jamais stockées en base)
export const TOUS = 'tous';
export const A_COMPLETER = 'a_completer';

export const labelCategorie = (id) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? 'Non renseignée';

// On ne stocke que le PG (0-100). Le VG se déduit : VG = 100 - PG.
// Ça évite les incohérences du type "50/60".
export const formatPgVg = (pg) =>
  pg === null || pg === undefined || pg === '' ? '—' : `${pg}/${100 - pg}`;

// Vrai si le produit n'a pas encore été catégorisé (champ absent ou vide).
export const estACompleter = (product) =>
  !product.category || product.pg === null || product.pg === undefined || product.pg === '';
