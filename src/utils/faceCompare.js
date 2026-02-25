/**
 * Simple pixel-based face comparison utility.
 * Downscales two images to 64×64, normalizes pixel data, and compares.
 * Returns a similarity score between 0 (no match) and 1 (identical).
 */

const COMPARE_SIZE = 64;

/**
 * Load a base64 dataURL into an Image element.
 */
const loadImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

/**
 * Draw image onto a small canvas and return normalized grayscale pixel data.
 * Mean-subtracted so that background/lighting doesn't dominate similarity.
 */
const getFingerprint = async (dataUrl) => {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = COMPARE_SIZE;
  canvas.height = COMPARE_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, COMPARE_SIZE, COMPARE_SIZE);
  const { data } = ctx.getImageData(0, 0, COMPARE_SIZE, COMPARE_SIZE);

  // Convert to grayscale array
  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // Normalize: subtract mean so lighting/background doesn't dominate
  const mean = gray.reduce((s, v) => s + v, 0) / gray.length;
  const normalized = gray.map(v => v - mean);
  return normalized;
};

/**
 * Compute cosine similarity between two grayscale fingerprints.
 */
const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

/**
 * Compare two face photos (base64 dataURLs).
 * @returns {Promise<number>} Similarity 0–1
 */
export const compareFaces = async (photoA, photoB) => {
  try {
    const [fpA, fpB] = await Promise.all([
      getFingerprint(photoA),
      getFingerprint(photoB)
    ]);
    return cosineSimilarity(fpA, fpB);
  } catch (err) {
    console.error('Face comparison error:', err);
    return 0;
  }
};

/**
 * Compare a new photo against an array of stored face captures.
 * @param {string} newPhoto - base64 dataURL of the new face
 * @param {Array} storedCaptures - array of { photo, aadhaar, ... }
 * @param {number} threshold - similarity threshold (default 0.85)
 * @returns {Promise<object|null>} The matching capture, or null
 */
export const findMatchingFace = async (newPhoto, storedCaptures, threshold = 0.97) => {
  if (!storedCaptures || storedCaptures.length === 0) return null;

  const newFp = await getFingerprint(newPhoto);

  for (const capture of storedCaptures) {
    if (!capture.photo) continue;
    try {
      const storedFp = await getFingerprint(capture.photo);
      const similarity = cosineSimilarity(newFp, storedFp);
      console.log(`Face comparison with ${capture.aadhaar?.slice(-4)}: ${(similarity * 100).toFixed(1)}%`);
      if (similarity >= threshold) {
        return { ...capture, similarity };
      }
    } catch (e) {
      continue;
    }
  }
  return null;
};
