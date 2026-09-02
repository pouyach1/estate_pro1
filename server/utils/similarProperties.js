function scoreSimilarity(current, candidate) {
  if (!candidate || String(candidate._id) === String(current._id)) return -1;

  let score = 0;

  if (current.type && candidate.type === current.type) score += 40;
  if (current.location && candidate.location && candidate.location === current.location) score += 30;

  const currentPrice = Number(current.price) || 0;
  const candidatePrice = Number(candidate.price) || 0;
  if (currentPrice > 0 && candidatePrice > 0) {
    const ratio = candidatePrice / currentPrice;
    if (ratio >= 0.7 && ratio <= 1.3) score += 20;
    else if (ratio >= 0.5 && ratio <= 1.5) score += 10;
  }

  const currentArea = Number(current.area) || 0;
  const candidateArea = Number(candidate.area) || 0;
  if (currentArea > 0 && candidateArea > 0) {
    const areaRatio = candidateArea / currentArea;
    if (areaRatio >= 0.75 && areaRatio <= 1.25) score += 15;
  }

  if (current.beds && candidate.beds === current.beds) score += 10;
  if (candidate.isExclusive) score += 2;
  if (candidate.isFeatured) score += 1;

  return score;
}

function rankSimilarProperties(current, candidates, limit = 4) {
  return candidates
    .map((candidate) => ({ candidate, score: scoreSimilarity(current, candidate) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.candidate.createdAt) - new Date(a.candidate.createdAt))
    .slice(0, limit)
    .map((item) => item.candidate);
}

module.exports = { rankSimilarProperties };
