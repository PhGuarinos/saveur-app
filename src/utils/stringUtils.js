// src/utils/stringUtils.js
export const normalizeString = (str) => {
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const highlightMatch = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const normalizedText = normalizeString(text);
  const normalizedSearch = normalizeString(searchTerm);
  
  if (!normalizedText.includes(normalizedSearch)) {
    return text;
  }
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
};

export const cleanAndFormat = (str) => {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return str.trim();
};