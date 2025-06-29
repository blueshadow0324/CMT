const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const {
  initController,
  pairDevice,
  getAllPairedDevices,
  toggleDevice,
} = require("./controller");

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

async function startServer() {
  try {
    await initController();

    app.get("/api/devices", async (req, res) => {
      try {
        const devices = await getAllPairedDevices();
        res.json(devices);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/pair", async (req, res) => {
      const { discriminator, setupPin } = req.body;
      if (!discriminator || !setupPin) {
        return res.status(400).json({ error: "Missing discriminator or setupPin" });
      }
      try {
        const device = await pairDevice(discriminator, setupPin);
        res.json(device);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/toggle/:nodeId", async (req, res) => {
      const nodeId = req.params.nodeId;
      if (!nodeId) {
        return res.status(400).json({ error: "Missing nodeId" });
      }
      try {
        await toggleDevice(nodeId);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.listen(PORT, () => {
      console.log(`✅ Backend server listening on port ${PORT}`);
      console.log(`👉 Open http://localhost:${PORT} or http://<raspi-ip>:${PORT} in your browser`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();


