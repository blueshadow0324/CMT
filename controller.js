const matter = require("@project-chip/matter-node.js");
const fs = require("fs");
const path = require("path");

let controller;

async function initController() {
  try {
    const storagePath = path.join(__dirname, "matter-storage");
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }

    controller = await matter.Commissioner.create({
      storagePath,
      port: 5540,
    });

    await controller.start();
    console.log("✅ Matter Controller started and ready.");
  } catch (error) {
    console.error("❌ Failed to initialize Matter Controller:", error);
  }
}

async function pairDevice(discriminator, setupPin) {
  if (!controller) throw new Error("Controller not initialized");

  try {
    const device = await controller.commissionDevice({
      discovery: { discriminator: Number(discriminator) },
      passcode: Number(setupPin),
    });
    console.log("🎉 Device paired successfully:", device);
    return device;
  } catch (error) {
    console.error("❌ Pairing failed:", error);
    throw error;
  }
}

async function getAllPairedDevices() {
  if (!controller) throw new Error("Controller not initialized");
  return controller.getCommissionedDevices();
}

async function toggleDevice(deviceNodeId) {
  if (!controller) throw new Error("Controller not initialized");

  try {
    const device = await controller.getDevice(deviceNodeId);
    const onOffCluster = device.getClusterClient("OnOff");
    const currentState = await onOffCluster.readAttribute("onOff");
    await onOffCluster.invokeCommand(currentState ? "off" : "on", {});
    console.log(`🔁 Toggled device ${deviceNodeId} to ${currentState ? "OFF" : "ON"}`);
  } catch (error) {
    console.error(`❌ Could not toggle device ${deviceNodeId}:`, error);
    throw error;
  }
}

module.exports = {
  initController,
  pairDevice,
  getAllPairedDevices,
  toggleDevice,
};

