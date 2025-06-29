async function fetchDevices() {
  try {
    const res = await fetch("/api/devices");
    if (!res.ok) throw new Error("Failed to fetch devices");
    const devices = await res.json();
    renderDevices(devices);
  } catch (err) {
    alert("Error loading devices: " + err.message);
  }
}

function renderDevices(devices) {
  const tbody = document.querySelector("#devices tbody");
  tbody.innerHTML = "";

  if (!devices || devices.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No paired devices found.</td></tr>";
    return;
  }

  devices.forEach((device) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${device.nodeId || "N/A"}</td>
      <td>${device.vendorId || "N/A"}</td>
      <td>${device.productId || "N/A"}</td>
      <td>
        <button data-nodeid="${device.nodeId}" class="toggleBtn">Toggle On/Off</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".toggleBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const nodeId = e.target.getAttribute("data-nodeid");
      try {
        const res = await fetch(`/api/toggle/${nodeId}`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Toggle failed");
        alert("Device toggled successfully");
        fetchDevices(); // refresh states
      } catch (err) {
        alert("Error toggling device: " + err.message);
      }
    });
  });
}

document.getElementById("pairForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const discriminator = document.getElementById("discriminator").value;
  const setupPin = document.getElementById("setupPin").value;

  try {
    const res = await fetch("/api/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discriminator, setupPin }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Pairing failed");
    }
    alert("Device paired successfully!");
    fetchDevices();
    e.target.reset();
  } catch (err) {
    alert("Error pairing device: " + err.message);
  }
});

window.onload = () => {
  fetchDevices();
};

