// src/components/CategoryFilter.js
import React from 'react';
import { CATEGORIES, TOUS, A_COMPLETER, estACompleter } from '../constants/categories';
import '../styles/categoryFilter.css';

/**
 * Barre de filtre par catégorie.
 *
 * products    : la liste déjà filtrée par la recherche texte (sert aux compteurs)
 * value       : la catégorie sélectionnée (TOUS par défaut)
 * onChange    : callback(id)
 * showToFill  : affiche le filtre "À compléter" (admin uniquement)
 */
function CategoryFilter({ products, value, onChange, showToFill = false }) {
  const countFor = (id) => {
    if (id === TOUS) return products.length;
    if (id === A_COMPLETER) return products.filter(estACompleter).length;
    return products.filter((p) => p.category === id).length;
  };

  const options = [
    { id: TOUS, label: 'Tous' },
    ...CATEGORIES,
    ...(showToFill ? [{ id: A_COMPLETER, label: 'À compléter' }] : []),
  ];

  return (
    <div className="category-filter" role="group" aria-label="Filtrer par catégorie">
      {options.map((option) => {
        const count = countFor(option.id);
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={
              'category-filter__item' +
              (isActive ? ' category-filter__item--active' : '') +
              (option.id === A_COMPLETER ? ' category-filter__item--todo' : '')
            }
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            <span className="category-filter__count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
