const RISK_TERMS = ["guaranteed", "instant sales", "fake review", "spam", "buy followers"];

function scorePost(post) {
  const copy = String(post.copy || "");
  const hasCta = Boolean(post.cta);
  const hasRiskTerm = RISK_TERMS.some((term) => copy.toLowerCase().includes(term));
  const tooLong = copy.length > 280 && post.platform === "X";
  const hasBookLinkPlaceholder = copy.toLowerCase().includes("apple books");
  const score = 100 - (hasCta ? 0 : 18) - (hasRiskTerm ? 35 : 0) - (tooLong ? 15 : 0) - (hasBookLinkPlaceholder ? 0 : 8);

  return {
    contentId: post.id,
    platform: post.platform,
    score: Math.max(0, score),
    status: score >= 80 && !hasRiskTerm ? "approval-ready" : "needs-review",
    flags: [
      !hasCta ? "missing CTA" : "",
      hasRiskTerm ? "contains unsafe promotional language" : "",
      tooLong ? "too long for X" : "",
      !hasBookLinkPlaceholder ? "missing Apple Books CTA language" : ""
    ].filter(Boolean)
  };
}

export function createContentQualityReport(contentLibrary) {
  const scores = (contentLibrary.socialPosts || []).map(scorePost);
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, item) => total + item.score, 0) / scores.length)
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    averageScore,
    approvalReady: scores.filter((item) => item.status === "approval-ready").length,
    needsReview: scores.filter((item) => item.status === "needs-review").length,
    scores
  };
}

export function createApprovalPackets(state) {
  const booksById = Object.fromEntries(state.books.map((book) => [book.id, book]));

  return (state.postQueue || []).slice(0, 12).map((item) => ({
    id: `approval-${item.id}`,
    queueItemId: item.id,
    platform: item.platform,
    bookTitle: booksById[item.bookId]?.title || "Cross-book campaign",
    copy: item.copy,
    cta: item.cta,
    scheduledAt: item.scheduledAt,
    approvalStatus: item.approvalStatus,
    checklist: [
      "No spam or fake engagement claim",
      "One clear CTA",
      "Apple Books or approved landing route present",
      "Platform length and tone reviewed",
      "Manual approval captured before live posting"
    ]
  }));
}
