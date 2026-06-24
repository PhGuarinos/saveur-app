// src/components/ImportExportData.js
import React, { useState } from 'react';

export default function ImportExportData({ products, onImport }) {
  const [jsonData, setJsonData] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleCopyData = () => {
    const dataToExport = JSON.stringify(products, null, 2);
    navigator.clipboard.writeText(dataToExport);
    alert('Données copiées dans le presse-papiers !');
  };

  const handleExportFile = () => {
    const dataToExport = JSON.stringify(products, null, 2);
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produits-export-${Date.now()}.json`;
    a.click();
  };

  const handleImportData = () => {
    if (!jsonData.trim()) {
      alert('Veuillez coller les données JSON');
      return;
    }

    try {
      let importedData = JSON.parse(jsonData);
      
      if (!Array.isArray(importedData)) {
        importedData = [importedData];
      }

      const validProducts = importedData.filter(product => {
        return product.name && product.manufacturer && Array.isArray(product.flavors);
      });

      if (validProducts.length === 0) {
        alert('Aucun produit valide trouvé dans les données JSON');
        return;
      }

      if (onImport) {
        onImport(validProducts);
      }

      setJsonData('');
      setShowImportArea(false);
    } catch (error) {
      console.error('Erreur parsing JSON:', error);
      alert('Erreur : JSON invalide. Vérifiez le format');
    }
  };

  const handleImportFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setJsonData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="import-export-data">
      <h3>Importation/Exportation des données</h3>
      
      <div className="export-buttons">
        <button 
          className="export-button"
          onClick={handleCopyData}
          type="button"
        >
          Copier les données
        </button>
        <button 
          className="export-button"
          onClick={handleExportFile}
          type="button"
        >
          Exporter en fichier
        </button>
      </div>

      <div className="import-buttons">
        <button 
          className="import-button"
          onClick={() => setShowImportArea(!showImportArea)}
          type="button"
        >
          {showImportArea ? 'Annuler' : 'Importer des données'}
        </button>
        <button 
          className="import-button"
          onClick={() => document.getElementById('json-file-input').click()}
          type="button"
        >
          Importer depuis fichier
        </button>
        <input
          id="json-file-input"
          type="file"
          accept=".json"
          onChange={handleImportFromFile}
          style={{ display: 'none' }}
        />
      </div>

      {showImportArea && (
        <div className="import-area">
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Collez vos données JSON ici..."
            rows={8}
          />
          <button
            className="confirm-button"
            onClick={handleImportData}
            type="button"
          >
            Confirmer l'importation
          </button>
        </div>
      )}
    </div>
  );
}