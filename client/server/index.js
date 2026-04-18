import express from "express";

const app = express();
const PORT = Number(process.env.PORT || 5050);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", system: "archaios-backend" });
});

app.get("/api/signals", (req, res) => {
  res.json({
    signals: [
      "AI content trend rising",
      "High engagement window detected",
      "Monetization opportunity available"
    ]
  });
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
