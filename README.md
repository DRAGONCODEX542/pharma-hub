# PharmaHub - Smart Pharmacy Management & Multi-Tier Pricing System

A full-stack, responsive pharmacy management system designed for **Windows PCs (Cashier/Dispensing Counter)** and **Android phones/tablets (Shelf Audits & Mobile POS)** running seamlessly from a single unified database.

---

## 🌟 Key Features

### 1. Brand vs Generic Multi-Tier Pricing Engine
- **Bioequivalent Alternatives Finder:** When a patient is on a budget, 1-click on **"Compare Brand / Generics"** shows all products with the same active molecule and strength.
- **Instant Savings Calculation:** Displays exact dollar difference and % saved (e.g., Augmentin \$26.50 vs Sandoz Amoksiklav \$16.00 vs Generic Amox/Clav \$9.80 — saving the patient 63%).
- **1-Click Substitute Dispense:** Switch the cart item directly to the affordable generic without having to re-enter dosages.

### 2. Unit Breakdown & Broken-Pack Dispensing
- Sell by **Full Box/Pack**, **Blister Strip**, or **Single Pill/Unit**.
- Fractional pricing auto-calculated or manually overridden.
- Stock automatically tracks both unopened boxes and loose pills.

### 3. FEFO Inventory (First Expired, First Out)
- When a sale is completed, the system automatically deducts stock from the **nearest expiring batch** first.
- **Expiry Risk Dashboard:** Warns of batches nearing shelf-life expiration (configurable threshold, default 90 days).
- **Quarantine & Low Stock Alerts:** Flags items that have fallen below the reorder point.

### 4. Fast POS & Dispensing
- Real-time product search by Brand name, Generic molecule, Barcode, or Manufacturer.
- Enter dosage instructions per medication (e.g., "1 tablet every 12 hours after food").
- Payment method support (Cash, Card, Insurance, Mobile Money / M-Pesa).
- Generates 80mm thermal receipts with 1-click print.

### 5. Multi-Device (Windows PC + Android Phone)
- Counter PC acts as the local pharmacy server.
- Android phone or tablet on the same Wi-Fi connects in real time to the same database.

---

## 🚀 How to Run

### On Windows PC:
1. Double click `start.bat` (or open PowerShell in this folder and run `npm start`).
2. Open your browser at:
   ```
   http://localhost:5000
   ```

### On Android Phone or Tablet:
1. Make sure your Android device is connected to the same Wi-Fi network as the PC.
2. Open Chrome on Android and go to:
   ```
   http://192.168.0.168:5000
   ```
3. *(Optional)* Tap the three dots menu in Chrome on Android and select **"Install App"** or **"Add to Home Screen"** to have it as a full-screen standalone app icon on your phone!

---

## 📁 Project Structure
- `server/`: Express REST API and SQLite database engine (`db.js`, `index.js`).
- `server/pharmacy.sqlite`: Local zero-config SQLite database.
- `client/`: React + Tailwind CSS + Lucide Icons responsive frontend.
- `client/dist/`: Production bundle served directly by the backend.
- `start.bat`: 1-click launcher for Windows.
