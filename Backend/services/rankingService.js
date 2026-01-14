function rankCandidates(matchResults) {
  const sorted = [...matchResults].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
  return sorted.map((m, idx) => ({
    application_id: m.application_id,
    rank: idx + 1,
    overall_score: m.overall_score,
    decision: m.overall_score >= 75 ? 'Shortlist' : m.overall_score >= 60 ? 'Hold' : 'Reject'
  }));
}

module.exports = { rankCandidates };