import asyncio
from bleak import BleakScanner, BleakClient

# Nanoleaf bulbs usually contain "Nanoleaf" or "Essentials" in their name
TARGET_NAME_KEYWORDS = ["Nanoleaf", "Essentials"]

async def discover_and_connect():
    print("🔍 Scanning for Bluetooth devices...")
    devices = await BleakScanner.discover(timeout=10)

    # Find Nanoleaf device by name keywords
    bulb = None
    for d in devices:
        if d.name and any(keyword in d.name for keyword in TARGET_NAME_KEYWORDS):
            bulb = d
            break

    if not bulb:
        print("❌ No Nanoleaf Essentials bulb found nearby.")
        return

    print(f"✅ Found bulb: {bulb.name} [{bulb.address}]")
    async with BleakClient(bulb.address) as client:
        connected = await client.is_connected()
        if not connected:
            print("❌ Failed to connect to the bulb.")
            return
        print("🔗 Connected to bulb.")

        print("\n📋 Discovering services and characteristics...")
        services = await client.get_services()
        for service in services:
            print(f"\nService: {service.uuid} - {service.description}")
            for char in service.characteristics:
                print(f"  Characteristic: {char.uuid} - {char.properties} - {char.description}")

        print("\n✨ You can now try controlling the bulb manually.")
        print("Options:\n 1: Turn ON\n 2: Turn OFF\n 3: Set Brightness\n 4: Exit")

        while True:
            choice = input("Enter option number: ").strip()
            if choice == "1":
                print("⚠️ Please input the UUID of the characteristic that controls power ON")
                uuid = input("Characteristic UUID: ").strip()
                # Nanoleaf power ON might be 0x01 or similar; you might need to test this
                await client.write_gatt_char(uuid, bytearray([0x01]))
                print("Sent POWER ON command.")
            elif choice == "2":
                print("⚠️ Please input the UUID of the characteristic that controls power OFF")
                uuid = input("Characteristic UUID: ").strip()
                await client.write_gatt_char(uuid, bytearray([0x00]))
                print("Sent POWER OFF command.")
            elif choice == "3":
                print("⚠️ Please input the UUID of the characteristic that controls brightness")
                uuid = input("Characteristic UUID: ").strip()
                try:
                    level = int(input("Brightness (0-100): "))
                    if level < 0 or level > 100:
                        print("Brightness must be 0-100.")
                        continue
                    # Convert brightness 0-100 to 0-255 byte value (guessing)
                    bri_byte = int(level / 100 * 255)
                    await client.write_gatt_char(uuid, bytearray([bri_byte]))
                    print(f"Set brightness to {level}%.")
                except ValueError:
                    print("Invalid brightness value.")
            elif choice == "4":
                print("Exiting...")
                break
            else:
                print("Invalid choice.")

asyncio.run(discover_and_connect())

