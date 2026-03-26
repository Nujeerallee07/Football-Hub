import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { footballRouter } from "./routes/football";
import { oddsRouter } from "./routes/odds";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/football", footballRouter);
app.use("/api/odds", oddsRouter);

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
