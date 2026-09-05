// src/components/BulkCategorize.js
import React, { useState, useMemo } from 'react';
import { CATEGORIES, estACompleter } from '../constants/categories';
import '../styles/bulkCategorize.css';

/**
 * Écran de catégorisation en masse.
 *
 * products   : tous les produits
 * onSaveAll  : callback(liste de { id, category, pg }) — enregistre en base
 */
export default function BulkCategorize({ products, onSaveAll }) {
  // Modifications en attente : { [productId]: { category, pg } }
  const [changes, setChanges] = useState({});
  const [onlyToFill, setOnlyToFill] = useState(true);
  const [saving, setSaving] = useState(false);

  const visibleProducts = useMemo(() => {
    const list = onlyToFill ? products.filter(estACompleter) : products;
    // Tri alphabétique : plus facile de s'y retrouver et de reprendre
    // où on s'était arrêté qu'avec l'ordre de la base.
    return [...list].sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''), 'fr')
    );
  }, [products, onlyToFill]);

  const valueFor = (product, field) => {
    if (changes[product.id] && changes[product.id][field] !== undefined) {
      return changes[product.id][field];
    }
    if (field === 'pg') {
      return product.pg === null || product.pg === undefined ? '' : String(product.pg);
    }
    return product.category || '';
  };

  const handleChange = (productId, field, value) => {
    setChanges(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value }
    }));
  };

  const changeCount = Object.keys(changes).length;

  const handleSave = async () => {
    if (changeCount === 0) {
      alert('Aucune modification à enregistrer.');
      return;
    }

    const payload = Object.entries(changes).map(([id, values]) => {
      const original = products.find(p => p.id === id);
      const category = values.category !== undefined
        ? values.category
        : (original?.category || null);
      const rawPg = values.pg !== undefined
        ? values.pg
        : (original?.pg ?? '');

      return {
        id,
        category: category || null,
        pg: rawPg === '' || rawPg === null || rawPg === undefined ? null : Number(rawPg)
      };
    });

    if (!window.confirm(`Enregistrer ${payload.length} produit(s) modifié(s) ?`)) return;

    setSaving(true);
    try {
      await onSaveAll(payload);
      setChanges({});
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement en masse:', error);
      alert('Erreur lors de l\'enregistrement. Vos modifications sont toujours à l\'écran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bulk-categorize">
      <h3>Catégorisation en masse</h3>

      <div className="bulk-categorize__toolbar">
        <label className="bulk-categorize__toggle">
          <input
            type="checkbox"
            checked={onlyToFill}
            onChange={(e) => setOnlyToFill(e.target.checked)}
          />
          Afficher uniquement les produits à compléter
        </label>

        <span className="bulk-categorize__status">
          {visibleProducts.length} produit(s) affiché(s)
          {changeCount > 0 && ` · ${changeCount} modification(s) non enregistrée(s)`}
        </span>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="bulk-categorize__empty">
          Tous les produits sont catégorisés.
        </p>
      ) : (
        <div className="bulk-categorize__table">
          <div className="bulk-categorize__head">
            <span>Produit</span>
            <span>Saveurs</span>
            <span>Catégorie</span>
            <span>PG</span>
          </div>

          {visibleProducts.map(product => {
            const isModified = Boolean(changes[product.id]);
            return (
              <div
                key={product.id}
                className={
                  'bulk-categorize__row' +
                  (isModified ? ' bulk-categorize__row--modified' : '')
                }
              >
                <span className="bulk-categorize__name">
                  <strong>{product.name}</strong>
                  <small>{product.manufacturer}</small>
                </span>

                <span className="bulk-categorize__flavors">
                  {Array.isArray(product.flavors) ? product.flavors.join(', ') : ''}
                </span>

                <select
                  value={valueFor(product, 'category')}
                  onChange={(e) => handleChange(product.id, 'category', e.target.value)}
                >
                  <option value="">—</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  placeholder="—"
                  value={valueFor(product, 'pg')}
                  onChange={(e) => handleChange(product.id, 'pg', e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="bulk-categorize__actions">
        <button
          type="button"
          className="confirm-button"
          onClick={handleSave}
          disabled={saving || changeCount === 0}
        >
          {saving ? 'Enregistrement...' : `Enregistrer (${changeCount})`}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => setChanges({})}
          disabled={saving || changeCount === 0}
        >
          Annuler les modifications
        </button>
      </div>
    </div>
  );
}
