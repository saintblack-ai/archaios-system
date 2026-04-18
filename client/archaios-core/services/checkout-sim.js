module.exports = function simulateCheckout(tier) {
  return {
    status: "success",
    tier,
    message: "Simulated checkout complete (no real charge)"
  };
};
