import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'pharmacy.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS molecules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      therapeutic_class TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_name TEXT NOT NULL,
      molecule_id INTEGER NOT NULL REFERENCES molecules(id),
      brand_tier TEXT NOT NULL DEFAULT 'generic', -- 'originator', 'branded_generic', 'generic'
      manufacturer TEXT,
      strength TEXT NOT NULL,
      dosage_form TEXT NOT NULL,
      barcode TEXT UNIQUE,
      category TEXT DEFAULT 'OTC', -- 'OTC', 'Prescription', 'Controlled'
      is_prescription_required INTEGER DEFAULT 0,
      unit_name TEXT DEFAULT 'Pill',
      units_per_pack INTEGER DEFAULT 100,
      units_per_strip INTEGER DEFAULT 10,
      pack_price REAL NOT NULL,
      strip_price REAL,
      unit_price REAL NOT NULL,
      insurance_pack_price REAL,
      wholesale_pack_price REAL,
      min_stock_alert INTEGER DEFAULT 10,
      reorder_quantity INTEGER DEFAULT 50,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
      batch_number TEXT NOT NULL,
      supplier TEXT,
      cost_price_per_pack REAL NOT NULL,
      packs_received INTEGER NOT NULL,
      packs_available INTEGER NOT NULL,
      loose_units_available INTEGER DEFAULT 0,
      manufacture_date TEXT,
      expiry_date TEXT NOT NULL, -- YYYY-MM-DD
      received_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' -- 'active', 'depleted', 'quarantined', 'expired'
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      customer_name TEXT DEFAULT 'Walk-in Customer',
      customer_phone TEXT,
      payment_method TEXT DEFAULT 'cash',
      prescribing_doctor TEXT,
      prescription_number TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      medicine_id INTEGER NOT NULL REFERENCES medicines(id),
      batch_id INTEGER REFERENCES batches(id),
      unit_type TEXT NOT NULL, -- 'pack', 'strip', 'unit'
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      dosage_instruction TEXT
    );

    CREATE TABLE IF NOT EXISTS customer_loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      national_id_or_notes TEXT,
      total_amount REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      balance_due REAL NOT NULL,
      promise_date TEXT NOT NULL, -- YYYY-MM-DD
      status TEXT DEFAULT 'pending', -- 'pending', 'overdue', 'partially_paid', 'paid'
      items_summary TEXT NOT NULL,
      sale_id INTEGER REFERENCES sales(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loan_repayments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL REFERENCES customer_loans(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Default settings if empty
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  if (!getSetting.get('pharmacy_name')) {
    insertSetting.run('pharmacy_name', 'HealthFirst Community Pharmacy');
    insertSetting.run('currency_symbol', '$');
    insertSetting.run('tax_rate', '0');
    insertSetting.run('expiry_warning_days', '90');
    insertSetting.run('address', '104 Healthcare Boulevard, Suite 2');
    insertSetting.run('phone', '+1 (555) 321-4567');
  }

  // Seed sample data if molecules is empty
  const countMolecules = db.prepare('SELECT count(*) as count FROM molecules').get();
  if (countMolecules.count === 0) {
    seedInitialData();
  }

  // Seed sample customer loans if empty
  const countLoans = db.prepare('SELECT count(*) as count FROM customer_loans').get();
  if (countLoans.count === 0) {
    const insertLoan = db.prepare(`
      INSERT INTO customer_loans (
        customer_name, customer_phone, national_id_or_notes,
        total_amount, amount_paid, balance_due, promise_date,
        status, items_summary, sale_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLoan.run(
      'John Kamau', '+254 712 345678', 'Trusted neighbor - regular chronic patient',
      26.50, 0, 26.50, '2026-10-17',
      'pending', 'Augmentin 625mg (1 Box)', 1, '2026-10-10 10:00:00'
    );

    insertLoan.run(
      'Grace Muthoni', '+254 722 987654', 'Works nearby, promised to clear after payday',
      18.50, 5.00, 13.50, '2026-10-11',
      'overdue', 'Panadol Extra (1 Box), Losec 20mg (1 Strip)', null, '2026-10-05 14:20:00'
    );
  }
}

function seedInitialData() {
  const insertMolecule = db.prepare(`
    INSERT INTO molecules (name, description, therapeutic_class) VALUES (?, ?, ?)
  `);

  const insertMedicine = db.prepare(`
    INSERT INTO medicines (
      brand_name, molecule_id, brand_tier, manufacturer, strength, dosage_form,
      barcode, category, is_prescription_required, unit_name, units_per_pack,
      units_per_strip, pack_price, strip_price, unit_price, insurance_pack_price,
      wholesale_pack_price, min_stock_alert, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertBatch = db.prepare(`
    INSERT INTO batches (
      medicine_id, batch_number, supplier, cost_price_per_pack,
      packs_received, packs_available, loose_units_available,
      manufacture_date, expiry_date, received_date, status
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  // 1. Amoxicillin / Clavulanate (Classic Brand vs Generic Example)
  const amoxMol = insertMolecule.run(
    'Amoxicillin + Clavulanic Acid',
    'Broad-spectrum antibacterial combination of penicillin and beta-lactamase inhibitor.',
    'Antibacterial / Penicillin'
  );
  const amoxId = amoxMol.lastInsertRowid;

  // Originator: Augmentin 625mg (GSK) - High price
  const aug = insertMedicine.run(
    'Augmentin 625mg', amoxId, 'originator', 'GlaxoSmithKline (GSK)', '625mg (500/125)', 'Tablet',
    '500045601234', 'Prescription', 1, 'Tablet', 14, 7, 26.50, 14.50, 2.20, 24.00, 22.00, 15, 'Originator brand. Film-coated tablets.'
  );
  insertBatch.run(aug.lastInsertRowid, 'AUG-2026-X1', 'Global Pharma Direct', 18.00, 50, 32, 4, '2025-06-10', '2027-08-31', '2025-08-15', 'active');
  insertBatch.run(aug.lastInsertRowid, 'AUG-2025-A9', 'Global Pharma Direct', 17.50, 30, 8, 2, '2024-11-01', '2026-11-30', '2025-01-20', 'active'); // Expiring in ~1.5 months

  // Branded Generic: Amoksiklav 625mg (Sandoz) - Mid price
  const amok = insertMedicine.run(
    'Amoksiklav 625mg', amoxId, 'branded_generic', 'Sandoz / Novartis', '625mg (500/125)', 'Tablet',
    '761234509876', 'Prescription', 1, 'Tablet', 14, 7, 16.00, 8.50, 1.30, 14.50, 13.00, 10, 'High quality branded generic'
  );
  insertBatch.run(amok.lastInsertRowid, 'AMK-8921B', 'Sandoz Distribution', 10.50, 40, 25, 3, '2025-08-01', '2027-12-15', '2025-10-01', 'active');

  // Pure Generic: Generic Amoxiclav 625mg - Budget price
  const genAmox = insertMedicine.run(
    'Amoxicillin-Clavulanate Generic', amoxId, 'generic', 'MedPharma Generics', '625mg (500/125)', 'Tablet',
    '890123456789', 'Prescription', 1, 'Tablet', 20, 10, 9.80, 5.20, 0.60, 8.50, 7.50, 20, 'Most affordable bioequivalent option'
  );
  insertBatch.run(genAmox.lastInsertRowid, 'MC-2490', 'Apex Healthcare', 5.50, 80, 58, 6, '2025-09-01', '2028-02-28', '2025-11-10', 'active');

  // 2. Paracetamol / Acetaminophen
  const paraMol = insertMolecule.run(
    'Paracetamol (Acetaminophen)',
    'Common analgesic and antipyretic for mild to moderate pain and fever.',
    'Analgesic / Antipyretic'
  );
  const paraId = paraMol.lastInsertRowid;

  // Originator: Panadol Extra 500mg
  const panadol = insertMedicine.run(
    'Panadol Extra', paraId, 'originator', 'Haleon / GSK', '500mg / 65mg Caffeine', 'Tablet',
    '500012345678', 'OTC', 0, 'Caplet', 24, 12, 6.50, 3.50, 0.35, 6.00, 5.00, 25, 'With Optizorb formula for rapid absorption'
  );
  insertBatch.run(panadol.lastInsertRowid, 'PAN-5541', 'Haleon Consumer Health', 3.80, 100, 64, 8, '2025-04-12', '2027-10-15', '2025-06-01', 'active');

  // Generic Paracetamol 500mg
  const genPara = insertMedicine.run(
    'Paracetamol BP 500mg', paraId, 'generic', 'National Labs', '500mg', 'Tablet',
    '890987654321', 'OTC', 0, 'Tablet', 100, 10, 4.00, 0.50, 0.05, 3.50, 3.00, 30, 'Standard generic bulk bottle/blisters'
  );
  insertBatch.run(genPara.lastInsertRowid, 'NL-PARA-99', 'National Labs Direct', 1.80, 150, 110, 40, '2025-07-20', '2028-06-30', '2025-09-05', 'active');

  // 3. Omeprazole (Gastro-resistant)
  const omepMol = insertMolecule.run(
    'Omeprazole',
    'Proton pump inhibitor that decreases stomach acid production for ulcers and GERD.',
    'Gastrointestinal / Proton Pump Inhibitor'
  );
  const omepId = omepMol.lastInsertRowid;

  // Brand: Losec / Prilosec 20mg
  const losec = insertMedicine.run(
    'Losec 20mg MUPS', omepId, 'originator', 'AstraZeneca', '20mg', 'Tablet',
    '731234567890', 'Prescription', 1, 'Tablet', 28, 7, 24.00, 6.50, 1.00, 22.00, 19.50, 10, 'AstraZeneca Multiple Unit Pellet System'
  );
  insertBatch.run(losec.lastInsertRowid, 'AZ-LSC-102', 'AstraZeneca Logistics', 16.00, 30, 14, 0, '2025-05-15', '2027-05-30', '2025-07-10', 'active');

  // Generic Omeprazole 20mg (Omez)
  const omez = insertMedicine.run(
    'Omez 20mg', omepId, 'branded_generic', "Dr. Reddy's", '20mg', 'Capsule',
    '890111222333', 'Prescription', 1, 'Capsule', 30, 10, 8.50, 3.00, 0.35, 7.50, 6.80, 20, 'Enteric-coated pellets in hard gelatin capsule'
  );
  insertBatch.run(omez.lastInsertRowid, 'DR-OMZ-771', 'Sun & Reddy Depot', 4.50, 60, 42, 5, '2025-03-01', '2026-12-10', '2025-05-20', 'active'); // Expiring in 2 months!

  // 4. Cetirizine (Antihistamine)
  const cetiMol = insertMolecule.run(
    'Cetirizine Hydrochloride',
    'Second-generation antihistamine used to treat allergic rhinitis, dermatitis, and urticaria.',
    'Antihistamine / Antiallergic'
  );
  const cetiId = cetiMol.lastInsertRowid;

  // Brand: Zyrtec 10mg
  const zyrtec = insertMedicine.run(
    'Zyrtec 10mg', cetiId, 'originator', 'UCB / J&J', '10mg', 'Tablet',
    '541234567890', 'OTC', 0, 'Tablet', 20, 10, 15.50, 8.00, 0.85, 14.00, 12.50, 15, 'Rapid 24-hour allergy symptom relief'
  );
  insertBatch.run(zyrtec.lastInsertRowid, 'ZYR-884', 'J&J Consumer Health', 9.50, 40, 18, 2, '2025-02-10', '2027-11-20', '2025-04-10', 'active');

  // Generic Cetirizine 10mg
  const genCeti = insertMedicine.run(
    'Cetirizine HCl 10mg', cetiId, 'generic', 'Teva Pharmaceuticals', '10mg', 'Tablet',
    '345678901234', 'OTC', 0, 'Tablet', 30, 10, 5.00, 2.00, 0.20, 4.50, 3.80, 20, 'Affordable daily allergy management'
  );
  insertBatch.run(genCeti.lastInsertRowid, 'TEV-CET-12', 'Teva Direct', 2.20, 80, 65, 8, '2025-08-10', '2028-04-30', '2025-10-15', 'active');

  // 5. Metformin (Antidiabetic)
  const metMol = insertMolecule.run(
    'Metformin Hydrochloride',
    'First-line medication for the treatment of type 2 diabetes mellitus.',
    'Antidiabetic / Biguanide'
  );
  const metId = metMol.lastInsertRowid;

  // Originator: Glucophage 850mg (Merck)
  const gluco = insertMedicine.run(
    'Glucophage 850mg', metId, 'originator', 'Merck Serono', '850mg', 'Tablet',
    '400123456789', 'Prescription', 1, 'Tablet', 60, 15, 18.00, 4.80, 0.35, 16.50, 14.00, 15, 'Innovator metformin formulation'
  );
  insertBatch.run(gluco.lastInsertRowid, 'GLU-902', 'Merck Healthcare Distribution', 11.00, 50, 28, 5, '2025-01-20', '2027-09-30', '2025-03-15', 'active');

  // Generic Metformin 850mg
  const genMet = insertMedicine.run(
    'Metformin 850mg Generic', metId, 'generic', 'Cipla Ltd', '850mg', 'Tablet',
    '890123987654', 'Prescription', 1, 'Tablet', 100, 10, 8.00, 0.90, 0.10, 7.00, 6.00, 20, 'High-volume chronic therapy pricing'
  );
  insertBatch.run(genMet.lastInsertRowid, 'CIP-MET-44', 'Cipla Supply', 3.50, 90, 72, 12, '2025-06-15', '2028-08-31', '2025-08-01', 'active');

  // Seed sample initial sales for dashboard trends
  const insertSale = db.prepare(`
    INSERT INTO sales (receipt_number, customer_name, customer_phone, payment_method, prescribing_doctor, prescription_number, subtotal, discount, tax, total, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSaleItem = db.prepare(`
    INSERT INTO sale_items (sale_id, medicine_id, batch_id, unit_type, quantity, unit_price, total_price, dosage_instruction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSale.run('REC-20261015-001', 'David Miller', '+1 555-4921', 'cash', 'Dr. Sarah Jenkins', 'RX-89421', 34.50, 0, 0, 34.50, '2026-10-15 09:30:00');
  insertSaleItem.run(s1.lastInsertRowid, aug.lastInsertRowid, 1, 'pack', 1, 26.50, 26.50, '1 tablet every 12 hours after food for 7 days');
  insertSaleItem.run(s1.lastInsertRowid, losec.lastInsertRowid, 6, 'strip', 1, 6.50, 6.50, '1 tablet every morning before breakfast');
  insertSaleItem.run(s1.lastInsertRowid, panadol.lastInsertRowid, 4, 'unit', 4, 0.35, 1.50, '2 tablets when in pain');

  const s2 = insertSale.run('REC-20261015-002', 'Elena Rostova', '+1 555-7722', 'card', '', '', 15.50, 0, 0, 15.50, '2026-10-15 11:15:00');
  insertSaleItem.run(s2.lastInsertRowid, zyrtec.lastInsertRowid, 8, 'pack', 1, 15.50, 15.50, '1 tablet daily at night');

  // Seed sample customer loans / credits
  const insertLoan = db.prepare(`
    INSERT INTO customer_loans (
      customer_name, customer_phone, national_id_or_notes,
      total_amount, amount_paid, balance_due, promise_date,
      status, items_summary, sale_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLoan.run(
    'John Kamau', '+254 712 345678', 'Trusted neighbor - regular chronic patient',
    26.50, 0, 26.50, '2026-10-16',
    'pending', 'Augmentin 625mg (1 Box)', s1.lastInsertRowid, '2026-10-10 10:00:00'
  );

  insertLoan.run(
    'Grace Muthoni', '+254 722 987654', 'Works nearby, promised to clear after payday',
    18.50, 5.00, 13.50, '2026-10-11',
    'overdue', 'Panadol Extra (1 Box), Losec 20mg (1 Strip)', null, '2026-10-05 14:20:00'
  );
}
