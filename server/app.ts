import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../client/build");

const app = express();
app.use(express.static(frontendPath));

app.get("/*s", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
