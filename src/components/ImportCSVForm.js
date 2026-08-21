// src/components/ImportCSVForm.js
import React, { useState } from 'react';
import { CATEGORIES } from '../constants/categories';

export default function ImportCSVForm({ onImportProducts }) {
  const [csvData, setCsvData] = useState('');
  const [delimiters, setDelimiters] = useState({
    auto: true,
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

  // Détecte le séparateur en comptant les occurrences dans la ligne d'en-têtes.
  const detectDelimiter = (text) => {
    const firstLine = text.trim().split(/\r?\n/)[0] || '';
    const candidates = [',', ';', '\t', '|'];
    let best = ',';
    let bestCount = 0;
    candidates.forEach((candidate) => {
      const count = firstLine.split(candidate).length - 1;
      if (count > bestCount) {
        bestCount = count;
        best = candidate;
      }
    });
    return best;
  };

  // Découpe une ligne en respectant les guillemets.
  // Indispensable : sans ça, une cellule comme "Fraise, Vanille" était
  // coupée en deux colonnes et décalait tout le reste de la ligne.
  const parseCSVLine = (line, delimiter) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"'; // guillemet échappé ("")
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values.map(v => v.trim());
  };

  const parseCSV = (text, delimiter) => {
    // \r?\n : gère aussi les fichiers enregistrés sous Windows,
    // dont le \r restait collé à la dernière colonne de chaque ligne.
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0], delimiter);
    return lines.slice(1).map(line => {
      const values = parseCSVLine(line, delimiter);
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      return obj;
    });
  };

  // Normalise pour comparer sans se soucier des accents ni de la casse.
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Convertit "Fruitée Gourmande", "fruitee gourmande", "FG"... vers l'id stocké.
  const parseCategory = (raw) => {
    if (!raw) return null;
    const value = normalize(raw).replace(/[\s_-]+/g, ' ');

    const direct = CATEGORIES.find(c => normalize(c.label) === value || c.id === value);
    if (direct) return direct.id;

    if (value === 'fruitee gourmande' || value === 'fg') return 'fruitee_gourmande';
    if (value === 'fruitee' || value === 'fruite' || value === 'fruit') return 'fruitee';
    if (value === 'gourmand' || value === 'gourmande') return 'gourmand';

    return null;
  };

  // Accepte "50", "50%", "50/50" (on ne garde que le PG).
  const parsePg = (raw) => {
    if (raw === null || raw === undefined || String(raw).trim() === '') return null;
    const first = String(raw).split('/')[0].replace('%', '').replace(',', '.').trim();
    const parsed = Number(first);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return null;
    return Math.round(parsed);
  };

  const processImportData = (data) => {
    return data.map((row) => {
      const name = findField(row, ['nom', 'name', 'produit']);
      const manufacturer = findField(row, ['fabricant', 'manufacturer', 'marque']);
      const flavorsStr = findField(row, ['saveurs', 'flavors', 'saveur']);
      const categoryStr = findField(row, ['categorie', 'category', 'catégorie']);
      const pgStr = findField(row, ['pg', 'pg/vg', 'ratio']);
      const image = findField(row, ['image', 'image_url', 'photo']);

      // Pas de champ "id" ici : Firestore génère l'identifiant lui-même.
      // L'ancien "id: index" envoyait un 0, 1, 2... en base pour rien.
      return {
        name: name || '',
        manufacturer: manufacturer || '',
        flavors: flavorsStr
          ? flavorsStr.split(/[,;|]/).map(f => f.trim()).filter(f => f)
          : [],
        category: parseCategory(categoryStr),
        pg: parsePg(pgStr),
        image: image || '/images/placeholder.jpg'
      };
    });
  };

  // On cherche d'abord une correspondance exacte, puis approximative.
  // Sans ça, une colonne "pg" pouvait être captée par n'importe quel
  // en-tête contenant ces deux lettres.
  const findField = (row, possibleNames) => {
    const keys = Object.keys(row);

    for (const name of possibleNames) {
      const exact = keys.find(key => normalize(key) === normalize(name));
      if (exact && row[exact]) return row[exact];
    }

    for (const name of possibleNames) {
      const partial = keys.find(key => normalize(key).includes(normalize(name)));
      if (partial && row[partial]) return row[partial];
    }

    return null;
  };

  const handleImport = () => {
    if (!csvData.trim()) {
      alert('Veuillez d\'abord charger un fichier CSV');
      return;
    }

    let delimiter;
    if (delimiters.semicolon) delimiter = ';';
    else if (delimiters.tab) delimiter = '\t';
    else if (delimiters.pipe) delimiter = '|';
    else if (delimiters.comma) delimiter = ',';
    else delimiter = detectDelimiter(csvData);

    try {
      const parsedData = parseCSV(csvData, delimiter);
      const processedData = processImportData(parsedData);
      const validProducts = processedData.filter(p => p.name && p.manufacturer);

      if (validProducts.length === 0) {
        alert('Aucun produit valide trouvé. Vérifiez le format de votre CSV.');
        return;
      }

      const ignored = processedData.length - validProducts.length;
      const withoutCategory = validProducts.filter(p => !p.category).length;

      // Récapitulatif avant écriture : l'import n'a pas de détection de
      // doublons, donc mieux vaut confirmer ce qui va partir en base.
      const recap = [
        `${validProducts.length} produit(s) prêt(s) à importer.`,
        ignored > 0 ? `${ignored} ligne(s) ignorée(s) (nom ou fabricant manquant).` : null,
        withoutCategory > 0 ? `${withoutCategory} sans catégorie (à compléter ensuite).` : null,
        '',
        'Confirmer l\'importation ?'
      ].filter(Boolean).join('\n');

      if (!window.confirm(recap)) return;

      if (onImportProducts) {
        onImportProducts(validProducts);
      }

      setCsvData('');
      setDelimiters({ auto: true, comma: false, semicolon: false, tab: false, pipe: false });
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'importation : ' + error.message);
    }
  };

  const selectDelimiter = (key) => {
    setDelimiters({
      auto: key === 'auto',
      comma: key === 'comma',
      semicolon: key === 'semicolon',
      tab: key === 'tab',
      pipe: key === 'pipe'
    });
  };

  const downloadTemplate = () => {
    const template = [
      'nom,fabricant,saveurs,categorie,pg,image',
      '"Tireboulette","Liquideo","Pêche, Mangue, Passion","Fruitée",50,',
      '"Exemple Gourmand","Marque Exemple","Café, Caramel, Noisette","Gourmand",30,'
    ].join('\n');

    // Le BOM (\uFEFF) force Excel à ouvrir le fichier en UTF-8,
    // sinon les accents s'affichent en caractères bizarres.
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
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
        assurez-vous que votre fichier CSV est enregistré au format UTF-8.
        Colonnes reconnues : nom, fabricant, saveurs, categorie, pg, image.
        <br />
      </div>

      <div className="csv-delimiter-buttons">
        <h4>Séparateur de votre CSV :</h4>
        <div className="button-group">
          <button
            type="button"
            className={delimiters.auto ? 'selected' : ''}
            onClick={() => selectDelimiter('auto')}
          >
            Détection auto
          </button>
          <button
            type="button"
            className={delimiters.comma ? 'selected' : ''}
            onClick={() => selectDelimiter('comma')}
          >
            Virgule (,)
          </button>
          <button
            type="button"
            className={delimiters.semicolon ? 'selected' : ''}
            onClick={() => selectDelimiter('semicolon')}
          >
            Point-virgule (;)
          </button>
          <button
            type="button"
            className={delimiters.tab ? 'selected' : ''}
            onClick={() => selectDelimiter('tab')}
          >
            Tabulation
          </button>
          <button
            type="button"
            className={delimiters.pipe ? 'selected' : ''}
            onClick={() => selectDelimiter('pipe')}
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
            setDelimiters({ auto: true, comma: false, semicolon: false, tab: false, pipe: false });
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
