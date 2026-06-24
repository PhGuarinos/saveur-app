// src/components/ImportCSVForm.js
import React, { useState } from 'react';

export default function ImportCSVForm({ onImportProducts }) {
  const [csvData, setCsvData] = useState('');
  const [delimiters, setDelimiters] = useState({
    comma: false,
    semicolon: false,
    tab: false,
    pipe: false
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text, delimiter) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim());
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      return obj;
    });
  };

  const processImportData = (data) => {
    return data.map((row, index) => {
      const name = findField(row, ['nom', 'name', 'produit']);
      const manufacturer = findField(row, ['fabricant', 'manufacturer', 'marque']);
      const flavorsStr = findField(row, ['saveurs', 'flavors', 'saveur']);
      const image = findField(row, ['image', 'image_url', 'photo']);

      return {
        id: index,
        name: name || '',
        manufacturer: manufacturer || '',
        flavors: flavorsStr ? flavorsStr.split(/[,;|]/).map(f => f.trim()).filter(f => f) : [],
        image: image || '/images/placeholder.jpg'
      };
    });
  };

  const findField = (row, possibleNames) => {
    for (const name of possibleNames) {
      const field = Object.keys(row).find(key => 
        key.toLowerCase().includes(name.toLowerCase())
      );
      if (field && row[field]) return row[field];
    }
    return null;
  };

  const handleImport = () => {
    if (!csvData.trim()) {
      alert('Veuillez d\'abord charger un fichier CSV');
      return;
    }

    let delimiter = ',';
    if (delimiters.semicolon) delimiter = ';';
    if (delimiters.tab) delimiter = '\t';
    if (delimiters.pipe) delimiter = '|';

    try {
      const parsedData = parseCSV(csvData, delimiter);
      const processedData = processImportData(parsedData);
      const validProducts = processedData.filter(p => p.name && p.manufacturer);

      if (validProducts.length === 0) {
        alert('Aucun produit valide trouvé. Vérifiez le format de votre CSV.');
        return;
      }

      if (onImportProducts) {
        onImportProducts(validProducts);
      }

      setCsvData('');
      setDelimiters({ comma: false, semicolon: false, tab: false, pipe: false });
      alert(`${validProducts.length} produits importés !`);
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'importation : ' + error.message);
    }
  };

  const downloadTemplate = () => {
    const template = 'nom,fabricant,saveurs,image\nExemple Produit,Marque Exemple,"Saveur1, Saveur2",/images/exemple.jpg';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_produits.csv';
    link.click();
  };

  return (
    <div className="import-csv-form">
      <h3>Importer des produits depuis CSV</h3>

      <div className="csv-encoding-note">
        <span className="info-icon">i</span>
        <strong>Note importante :</strong> Pour une prise en charge correcte des accents,
        assurez-vous que votre fichier CSV est enregistré au format UTF-8 avec des virgules comme séparateur.
        <br />
      </div>

      <div className="csv-delimiter-buttons">
        <h4>Sélectionnez le séparateur de votre CSV :</h4>
        <div className="button-group">
          <button
            type="button"
            className={delimiters.comma ? 'selected' : ''}
            onClick={() => setDelimiters({ comma: true, semicolon: false, tab: false, pipe: false })}
          >
            Virgule (,)
          </button>
          <button
            type="button"
            className={delimiters.semicolon ? 'selected' : ''}
            onClick={() => setDelimiters({ comma: false, semicolon: true, tab: false, pipe: false })}
          >
            Point-virgule (;)
          </button>
          <button
            type="button"
            className={delimiters.tab ? 'selected' : ''}
            onClick={() => setDelimiters({ comma: false, semicolon: false, tab: true, pipe: false })}
          >
            Tabulation
          </button>
          <button
            type="button"
            className={delimiters.pipe ? 'selected' : ''}
            onClick={() => setDelimiters({ comma: false, semicolon: false, tab: false, pipe: true })}
          >
            Tuyau (|)
          </button>
        </div>
      </div>

      <div className="csv-upload-area">
        <label htmlFor="csv-file-input">Choisir un fichier CSV :</label>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </div>

      <div className="csv-content-display">
        <h4>Contenu du fichier :</h4>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Le contenu de votre fichier CSV s'affichera ici..."
          rows={10}
          readOnly
        />
      </div>

      <div className="csv-encoding-note">
        <span className="info-icon">i</span>
        <strong>Important :</strong> Collez exactement ce qui a été exporté sans modifier aucun caractère.
        <br />
      </div>

      <div className="template-links">
        <button type="button" className="template-link" onClick={downloadTemplate}>
          Télécharger le modèle
        </button>
      </div>

      <div className="import-buttons">
        <button
          type="button"
          className="confirm-button"
          onClick={handleImport}
        >
          Confirmer l'importation
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setCsvData('');
            setDelimiters({ comma: false, semicolon: false, tab: false, pipe: false });
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}