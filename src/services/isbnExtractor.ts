import { normalizeIsbn } from './bookService';

/**
 * Validates whether a 10-digit ISBN has a valid checksum.
 */
export function isValidIsbn10(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (!/^[0-9]{9}[0-9X]$/i.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  const lastChar = clean[9].toUpperCase();
  const checkValue = lastChar === 'X' ? 10 : parseInt(lastChar, 10);
  sum += checkValue;

  return sum % 11 === 0;
}

/**
 * Validates whether a 13-digit ISBN has a valid checksum.
 */
export function isValidIsbn13(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (!/^(978|979)[0-9]{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[12], 10);
}

/**
 * Validates whether a candidate string is a valid ISBN-10 or ISBN-13.
 */
export function isValidIsbn(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (clean.length === 10) return isValidIsbn10(clean);
  if (clean.length === 13) return isValidIsbn13(clean);
  return false;
}

/**
 * Extracts all unique ISBN candidates from raw OCR or arbitrary text.
 * Finds sequences prefixed by "ISBN" or matching standard ISBN-10 / ISBN-13 formats with or without hyphens.
 * Returns valid ISBNs deduplicated and ordered by priority (ISBNs with valid check digits first).
 */
export function extractIsbnsFromText(text: string): string[] {
  if (!text) return [];

  // Match patterns like:
  // ISBN-13: 978-80-7203-123-4
  // ISBN: 978 80 7203 123 4
  // ISBN 80-85983-44-3
  // 978-80-247-1234-5
  // or bare 13/10 digit numbers
  const results: string[] = [];
  const seenClean = new Set<string>();

  // 1. First look for explicit "ISBN" prefix lines or tokens
  const explicitIsbnRegex = /ISBN(?:-1[03])?[:\s#\t]*([0-9Xx\s\-–—]{10,24})/gi;
  let match: RegExpExecArray | null;

  while ((match = explicitIsbnRegex.exec(text)) !== null) {
    const rawMatch = match[1];
    // Find valid 10 or 13 substrings inside candidate
    const subCandidates = extractCandidateSequences(rawMatch);
    for (const sub of subCandidates) {
      const cleanSub = normalizeIsbn(sub);
      if (!seenClean.has(cleanSub) && (cleanSub.length === 10 || cleanSub.length === 13)) {
        seenClean.add(cleanSub);
        results.push(cleanSub);
      }
    }
  }

  // 2. Look for standalone ISBN-13 patterns (starting with 978 or 979)
  const isbn13Regex = /(?:978|979)[\s\-–—]?[0-9]{1,5}[\s\-–—]?[0-9]{1,7}[\s\-–—]?[0-9]{1,7}[\s\-–—]?[0-9]/g;
  while ((match = isbn13Regex.exec(text)) !== null) {
    const cleanCandidate = normalizeIsbn(match[0]);
    if (cleanCandidate.length === 13 && !seenClean.has(cleanCandidate)) {
      seenClean.add(cleanCandidate);
      results.push(cleanCandidate);
    }
  }

  // 3. Fallback: Search for any continuous sequences of digits/hyphens that form 10 or 13 digits
  const generalSeqRegex = /(?:[0-9Xx][\s\-–—]*){10,17}/g;
  while ((match = generalSeqRegex.exec(text)) !== null) {
    const raw = match[0];
    const cleanCandidate = normalizeIsbn(raw);
    if ((cleanCandidate.length === 10 || cleanCandidate.length === 13) && !seenClean.has(cleanCandidate)) {
      // For general sequences without explicit ISBN or 978 prefix, only accept if valid checksum
      if (isValidIsbn(cleanCandidate)) {
        seenClean.add(cleanCandidate);
        results.push(cleanCandidate);
      }
    }
  }

  // Sort candidates so that those with valid checksums appear first
  return results.sort((a, b) => {
    const aValid = isValidIsbn(a);
    const bValid = isValidIsbn(b);
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    return 0;
  });
}

function extractCandidateSequences(rawText: string): string[] {
  const cleaned = rawText.replace(/[^0-9Xx]/g, '');
  const out: string[] = [];

  // If starts with 978 or 979 and has at least 13 characters
  if ((cleaned.startsWith('978') || cleaned.startsWith('979')) && cleaned.length >= 13) {
    out.push(cleaned.slice(0, 13));
  } else if (cleaned.length === 10) {
    out.push(cleaned);
  } else if (cleaned.length === 13) {
    out.push(cleaned);
  } else if (cleaned.length > 13) {
    // Check if 978 / 979 exists inside
    const idx978 = cleaned.search(/97[89]/);
    if (idx978 !== -1 && cleaned.length >= idx978 + 13) {
      out.push(cleaned.slice(idx978, idx978 + 13));
    }
  }

  return out;
}
