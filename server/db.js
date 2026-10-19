import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'pharmacy.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable high-performance WAL mode and data integrity pragmas
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `v2:${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  try {
    const parts = storedHash.split(':');
    if (parts.length === 4 && parts[0] === 'v2') {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const originalHash = parts[3];
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
    } else if (parts.length === 2) {
      // Backward-compatibility for legacy 1000-iteration accounts
      const [salt, originalHash] = parts;
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
    }
  } catch {
    return false;
  }
  return false;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      google_picture TEXT,
      name TEXT NOT NULL,
      pharmacy_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      phone TEXT,
      address TEXT,
      currency_symbol TEXT DEFAULT 'KSh',
      created_at TEXT NOT NULL
    );

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
      form_category TEXT DEFAULT 'Tablets & Capsules',
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
      status TEXT DEFAULT 'active', -- 'active', 'depleted', 'quarantined', 'expired'
      user_id INTEGER DEFAULT -1
    );

    CREATE TABLE IF NOT EXISTS pharmacy_medicine_prices (
      user_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      pack_price REAL,
      strip_price REAL,
      unit_price REAL,
      wholesale_pack_price REAL,
      min_stock_alert INTEGER,
      updated_at TEXT,
      PRIMARY KEY (user_id, medicine_id)
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

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      user_json TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Safe schema migrations for existing databases
  try { db.exec('ALTER TABLE sales ADD COLUMN user_id INTEGER;'); } catch (e) {}
  try { db.exec('ALTER TABLE customer_loans ADD COLUMN user_id INTEGER;'); } catch (e) {}
  try { db.exec("ALTER TABLE medicines ADD COLUMN form_category TEXT DEFAULT 'Tablets & Capsules';"); } catch (e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN user_id INTEGER DEFAULT -1;'); } catch (e) {}

  // Multi-tier subscriptions & Organization RBAC migrations
  try { db.exec("ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'solo';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'trial';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN trial_ends_at TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN organization_id INTEGER;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN allowed_departments TEXT DEFAULT '[\"All\"]';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[\"pos\",\"inventory_read\",\"inventory_write\",\"accounting\",\"settings\",\"staff_management\"]';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN staff_title TEXT DEFAULT 'Administrator';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN work_domain TEXT;"); } catch (e) {}

  // Backfill existing users with 30-day trial and self-organization id
  try {
    db.exec(`
      UPDATE users
      SET organization_id = id
      WHERE organization_id IS NULL;

      UPDATE users
      SET account_type = 'solo'
      WHERE account_type IS NULL;

      UPDATE users
      SET subscription_tier = 'trial'
      WHERE subscription_tier IS NULL;

      UPDATE users
      SET trial_ends_at = datetime('now', '+30 days')
      WHERE trial_ends_at IS NULL;

      UPDATE users
      SET allowed_departments = '["All"]'
      WHERE allowed_departments IS NULL;
    `);
  } catch (e) {}

  // Ensure pharmacy_medicine_prices exists on existing databases
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS pharmacy_medicine_prices (
        user_id INTEGER NOT NULL,
        medicine_id INTEGER NOT NULL,
        pack_price REAL,
        strip_price REAL,
        unit_price REAL,
        wholesale_pack_price REAL,
        min_stock_alert INTEGER,
        allow_strip_sales INTEGER DEFAULT 1,
        allow_unit_sales INTEGER DEFAULT 1,
        updated_at TEXT,
        PRIMARY KEY (user_id, medicine_id)
      );
    `);
  } catch (e) {}
  try { db.exec('ALTER TABLE pharmacy_medicine_prices ADD COLUMN allow_strip_sales INTEGER DEFAULT 1;'); } catch (e) {}
  try { db.exec('ALTER TABLE pharmacy_medicine_prices ADD COLUMN allow_unit_sales INTEGER DEFAULT 1;'); } catch (e) {}

  // Isolate demo/sample loans and batches so newly registered real pharmacists always start with a clean 0-loan ledger and 0 false expiry alerts
  try {
    db.exec(`
      UPDATE customer_loans
      SET user_id = -1
      WHERE customer_name IN ('John Kamau', 'Grace Muthoni') OR user_id IS NULL;
    `);
    db.exec(`
      UPDATE sales
      SET user_id = -1
      WHERE user_id IS NULL;
    `);
    db.exec(`
      UPDATE batches
      SET user_id = -1
      WHERE user_id IS NULL;
    `);
    db.exec(`
      UPDATE medicines
      SET form_category = 'Tablets & Capsules'
      WHERE form_category IS NULL OR form_category = '';
    `);
  } catch (e) {}

  // ── Wholesale Portal Tables ──────────────────────────────────────────────
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS wholesalers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        county TEXT,
        description TEXT,
        account_type TEXT DEFAULT 'wholesale',
        subscription_tier TEXT DEFAULT 'trial',
        trial_ends_at TEXT,
        organization_id INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wholesaler_catalog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wholesaler_id INTEGER NOT NULL REFERENCES wholesalers(id) ON DELETE CASCADE,
        medicine_name TEXT NOT NULL,
        brand_name TEXT,
        strength TEXT,
        dosage_form TEXT,
        pack_size INTEGER DEFAULT 100,
        cost_price_per_pack REAL NOT NULL,
        packs_available INTEGER DEFAULT 0,
        expiry_date TEXT,
        category TEXT DEFAULT 'OTC',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stock_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        medicine_id INTEGER,
        medicine_name TEXT NOT NULL,
        current_stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 10,
        alert_type TEXT DEFAULT 'low_stock',
        is_resolved INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wholesale_delivery_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wholesaler_id INTEGER NOT NULL,
        pharmacy_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        delivery_location TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending', -- 'pending', 'packed', 'dispatched', 'delivered'
        driver_name TEXT,
        vehicle_plate TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS mpesa_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        checkout_request_id TEXT UNIQUE,
        merchant_request_id TEXT,
        amount REAL NOT NULL,
        phone TEXT NOT NULL,
        plan_tier TEXT NOT NULL,
        account_type TEXT DEFAULT 'solo',
        status TEXT DEFAULT 'pending',
        result_code INTEGER,
        result_desc TEXT,
        mpesa_receipt TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);
  } catch (e) {}

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

  // Proactively ensure comprehensive drug templates (Ointments, Syrups, Drops, Inhalers, Injections, Supplies) exist
  seedComprehensiveTemplates();

  // Seed Kenyan Wholesale Distributors and Live Warehouse Catalog if empty
  try {
    const countWholesalers = db.prepare('SELECT count(*) as count FROM wholesalers').get();
    if (countWholesalers.count === 0) {
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const w1 = db.prepare(`
        INSERT INTO wholesalers (name, contact_person, phone, email, address, county, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Harleys Pharma Distributors Ltd',
        'Sales Desk (Nairobi Hub)',
        '+254 722 000111',
        'orders@harleys.co.ke',
        'Harleys Building, Commercial St, Industrial Area',
        'Nairobi',
        'Top pharmaceutical & surgical importer. Official distributor for GSK, Novartis, Pfizer.',
        nowStr
      );

      const w2 = db.prepare(`
        INSERT INTO wholesalers (name, contact_person, phone, email, address, county, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Laborex Kenya Ltd',
        'Wholesale Operations',
        '+254 733 444555',
        'orders@laborex.co.ke',
        'Mombasa Road, Opp. Standard Group',
        'Nairobi',
        'Pan-African distributor of ethical drugs, OTC, vaccines, cold chain and animal health items.',
        nowStr
      );

      const w3 = db.prepare(`
        INSERT INTO wholesalers (name, contact_person, phone, email, address, county, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Crown Healthcare Distributors',
        'Medical Supplies Rep',
        '+254 720 888999',
        'dispatch@crown.co.ke',
        'Enterprise Road, Industrial Area',
        'Nairobi',
        'Specialists in essential generics, surgical sundries, diagnostics, and OTC formulations.',
        nowStr
      );

      const insertCatalog = db.prepare(`
        INSERT INTO wholesaler_catalog (
          wholesaler_id, medicine_name, brand_name, strength, dosage_form,
          pack_size, cost_price_per_pack, packs_available, expiry_date, category, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const w1Id = Number(w1.lastInsertRowid);
      const w2Id = Number(w2.lastInsertRowid);
      const w3Id = Number(w3.lastInsertRowid);

      insertCatalog.run(w1Id, 'Amoxicillin + Clavulanic Acid', 'Augmentin 625mg', '625mg', 'Tablets', 14, 1250, 450, '2027-08-30', 'Prescription', nowStr);
      insertCatalog.run(w1Id, 'Paracetamol BP', 'Panadol Extra', '500mg/65mg', 'Tablets', 100, 480, 1200, '2028-02-15', 'OTC', nowStr);
      insertCatalog.run(w1Id, 'Cetirizine Hydrochloride', 'Zyrtec 10mg', '10mg', 'Tablets', 30, 850, 320, '2027-11-20', 'OTC', nowStr);

      insertCatalog.run(w2Id, 'Artemether + Lumefantrine', 'Coartem 20/120', '20/120mg', 'Tablets', 24, 380, 800, '2027-06-10', 'Prescription', nowStr);
      insertCatalog.run(w2Id, 'Azithromycin Dihydrate', 'Zithromax 500mg', '500mg', 'Tablets', 3, 620, 500, '2027-09-15', 'Prescription', nowStr);
      insertCatalog.run(w2Id, 'Metformin Hydrochloride', 'Glucophage 500mg', '500mg', 'Tablets', 100, 750, 600, '2027-12-01', 'Prescription', nowStr);

      insertCatalog.run(w3Id, 'Ibuprofen BP', 'Brufen 400mg', '400mg', 'Tablets', 100, 350, 950, '2027-10-18', 'OTC', nowStr);
      insertCatalog.run(w3Id, 'Omeprazole BP', 'Omez 20mg', '20mg', 'Capsules', 30, 280, 700, '2027-07-25', 'Prescription', nowStr);
      insertCatalog.run(w3Id, 'Ciprofloxacin', 'Ciproxin 500mg', '500mg', 'Tablets', 10, 220, 820, '2027-05-14', 'Prescription', nowStr);
      // Seed sample wholesale dispatch delivery orders
      const countOrders = db.prepare('SELECT count(*) as count FROM wholesale_delivery_orders').get();
      if (countOrders.count === 0) {
        const insertOrder = db.prepare(`
          INSERT INTO wholesale_delivery_orders (
            wholesaler_id, pharmacy_name, contact_phone, delivery_location, items_json, total_amount, status, driver_name, vehicle_plate, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertOrder.run(
          w1Id,
          'Metropolitan Care Pharmacy',
          '+254 722 998877',
          'Ngong Road, Next to Prestige Plaza, Nairobi',
          JSON.stringify([{ item: 'Augmentin 625mg', qty: 25, price: 1250 }, { item: 'Panadol Extra', qty: 50, price: 480 }]),
          55250,
          'dispatched',
          'David Ochieng',
          'KBZ 482Y',
          nowStr
        );

        insertOrder.run(
          w1Id,
          'HealthFirst Community Chemist',
          '+254 711 334455',
          'Biashara Street, CBD, Nairobi',
          JSON.stringify([{ item: 'Zyrtec 10mg', qty: 15, price: 850 }]),
          12750,
          'pending',
          null,
          null,
          nowStr
        );
      }
    }
  } catch (e) {
    console.error('Error seeding wholesalers:', e);
  }

  // Seed sample customer loans for demo mode only (user_id = -1)
  const countLoans = db.prepare('SELECT count(*) as count FROM customer_loans').get();
  if (countLoans.count === 0) {
    const insertLoan = db.prepare(`
      INSERT INTO customer_loans (
        customer_name, customer_phone, national_id_or_notes,
        total_amount, amount_paid, balance_due, promise_date,
        status, items_summary, sale_id, created_at, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLoan.run(
      'John Kamau', '+254 712 345678', 'Trusted neighbor - regular chronic patient',
      26.50, 0, 26.50, '2026-10-17',
      'pending', 'Augmentin 625mg (1 Box)', 1, '2026-10-10 10:00:00', -1
    );

    insertLoan.run(
      'Grace Muthoni', '+254 722 987654', 'Works nearby, promised to clear after payday',
      18.50, 5.00, 13.50, '2026-10-11',
      'overdue', 'Panadol Extra (1 Box), Losec 20mg (1 Strip)', null, '2026-10-05 14:20:00', -1
    );
  }

  // ─── Safe schema migrations ───────────────────────────────────────────────
  try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin';"); } catch (e) {}
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Owner / Superadmin Account Seed ─────────────────────────────────────
  // Credentials come exclusively from Render environment variables.
  // NEVER hard-code real credentials here.
  const OWNER_EMAIL    = process.env.OWNER_EMAIL;
  const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
  const OWNER_NAME     = process.env.OWNER_NAME     || 'Owner';
  const OWNER_PHONE    = process.env.OWNER_PHONE    || '';
  const OWNER_PHARMACY = process.env.OWNER_PHARMACY || 'PharmaHub HQ';

  if (OWNER_EMAIL && OWNER_PASSWORD) {
    const existingOwner = db.prepare('SELECT id, role FROM users WHERE email = ?').get(OWNER_EMAIL);
    if (!existingOwner) {
      // Create fresh owner account
      const ownerHash = hashPassword(OWNER_PASSWORD);
      db.prepare(`
        INSERT INTO users (email, password_hash, name, pharmacy_name, role, phone, currency_symbol, created_at)
        VALUES (?, ?, ?, ?, 'superadmin', ?, 'KSh', ?)
      `).run(OWNER_EMAIL, ownerHash, OWNER_NAME, OWNER_PHARMACY, OWNER_PHONE, new Date().toISOString());
      console.log('[PharmaHub] ✅ Owner superadmin account created:', OWNER_EMAIL);
    } else if (existingOwner.role !== 'superadmin') {
      // Promote existing account to superadmin + refresh password hash
      const ownerHash = hashPassword(OWNER_PASSWORD);
      db.prepare(`
        UPDATE users SET role = 'superadmin', password_hash = ?, phone = COALESCE(NULLIF(?, ''), phone)
        WHERE email = ?
      `).run(ownerHash, OWNER_PHONE, OWNER_EMAIL);
      console.log('[PharmaHub] ✅ Owner account promoted to superadmin:', OWNER_EMAIL);
    } else {
      // Always refresh the password hash in case env var changed
      const ownerHash = hashPassword(OWNER_PASSWORD);
      db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(ownerHash, OWNER_EMAIL);
      console.log('[PharmaHub] ✅ Owner superadmin account verified:', OWNER_EMAIL);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────
}

function seedInitialData() {
  const insertMolecule = db.prepare(`
    INSERT INTO molecules (name, description, therapeutic_class) VALUES (?, ?, ?)
  `);

  const insertMedicine = db.prepare(`
    INSERT INTO medicines (
      brand_name, molecule_id, brand_tier, manufacturer, strength, dosage_form,
      barcode, category, form_category, is_prescription_required, unit_name, units_per_pack,
      units_per_strip, pack_price, strip_price, unit_price, insurance_pack_price,
      wholesale_pack_price, min_stock_alert, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertBatch = db.prepare(`
    INSERT INTO batches (
      medicine_id, batch_number, supplier, cost_price_per_pack,
      packs_received, packs_available, loose_units_available,
      manufacture_date, expiry_date, received_date, status, user_id
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?
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
    '500045601234', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 14, 7, 26.50, 14.50, 2.20, 24.00, 22.00, 15, 'Originator brand. Film-coated tablets.'
  );
  insertBatch.run(aug.lastInsertRowid, 'AUG-2026-X1', 'Global Pharma Direct', 18.00, 50, 32, 4, '2025-06-10', '2027-08-31', '2025-08-15', 'active', -1);
  insertBatch.run(aug.lastInsertRowid, 'AUG-2025-A9', 'Global Pharma Direct', 17.50, 30, 8, 2, '2024-11-01', '2026-11-30', '2025-01-20', 'active', -1); // Expiring in ~1.5 months

  // Branded Generic: Amoksiklav 625mg (Sandoz) - Mid price
  const amok = insertMedicine.run(
    'Amoksiklav 625mg', amoxId, 'branded_generic', 'Sandoz / Novartis', '625mg (500/125)', 'Tablet',
    '761234509876', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 14, 7, 16.00, 8.50, 1.30, 14.50, 13.00, 10, 'High quality branded generic'
  );
  insertBatch.run(amok.lastInsertRowid, 'AMK-8921B', 'Sandoz Distribution', 10.50, 40, 25, 3, '2025-08-01', '2027-12-15', '2025-10-01', 'active', -1);

  // Pure Generic: Generic Amoxiclav 625mg - Budget price
  const genAmox = insertMedicine.run(
    'Amoxicillin-Clavulanate Generic', amoxId, 'generic', 'MedPharma Generics', '625mg (500/125)', 'Tablet',
    '890123456789', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 20, 10, 9.80, 5.20, 0.60, 8.50, 7.50, 20, 'Most affordable bioequivalent option'
  );
  insertBatch.run(genAmox.lastInsertRowid, 'MC-2490', 'Apex Healthcare', 5.50, 80, 58, 6, '2025-09-01', '2028-02-28', '2025-11-10', 'active', -1);

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
    '500012345678', 'OTC', 'Tablets & Capsules', 0, 'Caplet', 24, 12, 6.50, 3.50, 0.35, 6.00, 5.00, 25, 'With Optizorb formula for rapid absorption'
  );
  insertBatch.run(panadol.lastInsertRowid, 'PAN-5541', 'Haleon Consumer Health', 3.80, 100, 64, 8, '2025-04-12', '2027-10-15', '2025-06-01', 'active', -1);

  // Generic Paracetamol 500mg
  const genPara = insertMedicine.run(
    'Paracetamol BP 500mg', paraId, 'generic', 'National Labs', '500mg', 'Tablet',
    '890987654321', 'OTC', 'Tablets & Capsules', 0, 'Tablet', 100, 10, 4.00, 0.50, 0.05, 3.50, 3.00, 30, 'Standard generic bulk bottle/blisters'
  );
  insertBatch.run(genPara.lastInsertRowid, 'NL-PARA-99', 'National Labs Direct', 1.80, 150, 110, 40, '2025-07-20', '2028-06-30', '2025-09-05', 'active', -1);

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
    '731234567890', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 28, 7, 24.00, 6.50, 1.00, 22.00, 19.50, 10, 'AstraZeneca Multiple Unit Pellet System'
  );
  insertBatch.run(losec.lastInsertRowid, 'AZ-LSC-102', 'AstraZeneca Logistics', 16.00, 30, 14, 0, '2025-05-15', '2027-05-30', '2025-07-10', 'active', -1);

  // Generic Omeprazole 20mg (Omez)
  const omez = insertMedicine.run(
    'Omez 20mg', omepId, 'branded_generic', "Dr. Reddy's", '20mg', 'Capsule',
    '890111222333', 'Prescription', 'Tablets & Capsules', 1, 'Capsule', 30, 10, 8.50, 3.00, 0.35, 7.50, 6.80, 20, 'Enteric-coated pellets in hard gelatin capsule'
  );
  insertBatch.run(omez.lastInsertRowid, 'DR-OMZ-771', 'Sun & Reddy Depot', 4.50, 60, 42, 5, '2025-03-01', '2026-12-10', '2025-05-20', 'active', -1); // Expiring in 2 months!

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
    '541234567890', 'OTC', 'Tablets & Capsules', 0, 'Tablet', 20, 10, 15.50, 8.00, 0.85, 14.00, 12.50, 15, 'Rapid 24-hour allergy symptom relief'
  );
  insertBatch.run(zyrtec.lastInsertRowid, 'ZYR-884', 'J&J Consumer Health', 9.50, 40, 18, 2, '2025-02-10', '2027-11-20', '2025-04-10', 'active', -1);

  // Generic Cetirizine 10mg
  const genCeti = insertMedicine.run(
    'Cetirizine HCl 10mg', cetiId, 'generic', 'Teva Pharmaceuticals', '10mg', 'Tablet',
    '345678901234', 'OTC', 'Tablets & Capsules', 0, 'Tablet', 30, 10, 5.00, 2.00, 0.20, 4.50, 3.80, 20, 'Affordable daily allergy management'
  );
  insertBatch.run(genCeti.lastInsertRowid, 'TEV-CET-12', 'Teva Direct', 2.20, 80, 65, 8, '2025-08-10', '2028-04-30', '2025-10-15', 'active', -1);

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
    '400123456789', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 60, 15, 18.00, 4.80, 0.35, 16.50, 14.00, 15, 'Innovator metformin formulation'
  );
  insertBatch.run(gluco.lastInsertRowid, 'GLU-902', 'Merck Healthcare Distribution', 11.00, 50, 28, 5, '2025-01-20', '2027-09-30', '2025-03-15', 'active', -1);

  // Generic Metformin 850mg
  const genMet = insertMedicine.run(
    'Metformin 850mg Generic', metId, 'generic', 'Cipla Ltd', '850mg', 'Tablet',
    '890123987654', 'Prescription', 'Tablets & Capsules', 1, 'Tablet', 100, 10, 8.00, 0.90, 0.10, 7.00, 6.00, 20, 'High-volume chronic therapy pricing'
  );
  insertBatch.run(genMet.lastInsertRowid, 'CIP-MET-44', 'Cipla Supply', 3.50, 90, 72, 12, '2025-06-15', '2028-08-31', '2025-08-01', 'active', -1);

  // Seed sample initial sales for dashboard trends (quarantined to user_id = -1)
  const insertSale = db.prepare(`
    INSERT INTO sales (receipt_number, customer_name, customer_phone, payment_method, prescribing_doctor, prescription_number, subtotal, discount, tax, total, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSaleItem = db.prepare(`
    INSERT INTO sale_items (sale_id, medicine_id, batch_id, unit_type, quantity, unit_price, total_price, dosage_instruction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSale.run('REC-20261015-001', 'David Miller', '+1 555-4921', 'cash', 'Dr. Sarah Jenkins', 'RX-89421', 34.50, 0, 0, 34.50, '2026-10-15 09:30:00', -1);
  insertSaleItem.run(s1.lastInsertRowid, aug.lastInsertRowid, 1, 'pack', 1, 26.50, 26.50, '1 tablet every 12 hours after food for 7 days');
  insertSaleItem.run(s1.lastInsertRowid, losec.lastInsertRowid, 6, 'strip', 1, 6.50, 6.50, '1 tablet every morning before breakfast');
  insertSaleItem.run(s1.lastInsertRowid, panadol.lastInsertRowid, 4, 'unit', 4, 0.35, 1.50, '2 tablets when in pain');

  const s2 = insertSale.run('REC-20261015-002', 'Elena Rostova', '+1 555-7722', 'card', '', '', 15.50, 0, 0, 15.50, '2026-10-15 11:15:00', -1);
  insertSaleItem.run(s2.lastInsertRowid, zyrtec.lastInsertRowid, 8, 'pack', 1, 15.50, 15.50, '1 tablet daily at night');

  // Seed sample customer loans / credits (quarantined to user_id = -1)
  const insertLoan = db.prepare(`
    INSERT INTO customer_loans (
      customer_name, customer_phone, national_id_or_notes,
      total_amount, amount_paid, balance_due, promise_date,
      status, items_summary, sale_id, created_at, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLoan.run(
    'John Kamau', '+254 712 345678', 'Trusted neighbor - regular chronic patient',
    26.50, 0, 26.50, '2026-10-16',
    'pending', 'Augmentin 625mg (1 Box)', s1.lastInsertRowid, '2026-10-10 10:00:00', -1
  );

  insertLoan.run(
    'Grace Muthoni', '+254 722 987654', 'Works nearby, promised to clear after payday',
    18.50, 5.00, 13.50, '2026-10-11',
    'overdue', 'Panadol Extra (1 Box), Losec 20mg (1 Strip)', null, '2026-10-05 14:20:00', -1
  );
}

// Comprehensive Pharmacy Drug & Supplies Template Catalog
// Serves as an instant ready-made formulary guide categorized across all departments
function seedComprehensiveTemplates() {
  const selectMol = db.prepare('SELECT id FROM molecules WHERE name = ?');
  const insertMol = db.prepare('INSERT INTO molecules (name, description, therapeutic_class) VALUES (?, ?, ?)');
  const selectMed = db.prepare('SELECT id FROM medicines WHERE brand_name = ?');
  const insertMed = db.prepare(`
    INSERT INTO medicines (
      brand_name, molecule_id, brand_tier, manufacturer, strength, dosage_form,
      barcode, category, form_category, is_prescription_required, unit_name, units_per_pack,
      units_per_strip, pack_price, strip_price, unit_price, insurance_pack_price,
      wholesale_pack_price, min_stock_alert, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  function getOrAddMolecule(name, desc, thClass) {
    let row = selectMol.get(name);
    if (!row) {
      const res = insertMol.run(name, desc, thClass);
      return res.lastInsertRowid;
    }
    return row.id;
  }

  function addTemplateMed(m) {
    const existing = selectMed.get(m.brand_name);
    if (!existing) {
      const molId = getOrAddMolecule(m.mol_name, m.mol_desc, m.mol_class);
      insertMed.run(
        m.brand_name, molId, m.brand_tier, m.manufacturer, m.strength, m.dosage_form,
        m.barcode || null, m.category, m.form_category, m.is_prescription_required ? 1 : 0,
        m.unit_name, m.units_per_pack, m.units_per_strip || null,
        Number(m.pack_price), m.strip_price ? Number(m.strip_price) : null,
        Number(m.unit_price), m.insurance_pack_price ? Number(m.insurance_pack_price) : null,
        m.wholesale_pack_price ? Number(m.wholesale_pack_price) : null,
        m.min_stock_alert || 10, m.notes || ''
      );
    }
  }

  // ─── 1. Ointments, Creams & Gels ──────────────────────────────────────────
  const hydroId = 'Hydrocortisone Topical';
  addTemplateMed({
    brand_name: 'Hydrocortisone 1% Cream (15g)',
    mol_name: hydroId, mol_desc: 'Mild topical corticosteroid for dermatitis, eczema, and skin irritation.', mol_class: 'Topical Corticosteroid',
    brand_tier: 'generic', manufacturer: 'MedPharma Skin Care', strength: '1% w/w', dosage_form: 'Cream',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 250, unit_price: 250, wholesale_pack_price: 160, min_stock_alert: 5,
    notes: 'Apply thinly 1-2 times daily to affected skin areas.'
  });

  const clotrimId = 'Clotrimazole Topical';
  addTemplateMed({
    brand_name: 'Canesten 1% Cream (20g)',
    mol_name: clotrimId, mol_desc: 'Broad spectrum antifungal for athlete foot, ringworm, and candidiasis.', mol_class: 'Antifungal / Imidazole',
    brand_tier: 'originator', manufacturer: 'Bayer Healthcare', strength: '1% w/w (20g)', dosage_form: 'Cream',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 650, unit_price: 650, wholesale_pack_price: 480, min_stock_alert: 5,
    notes: 'Innovator clotrimazole cream.'
  });
  addTemplateMed({
    brand_name: 'Clotrimazole 1% Cream (20g Generic)',
    mol_name: clotrimId, mol_desc: 'Broad spectrum antifungal for fungal skin infections.', mol_class: 'Antifungal / Imidazole',
    brand_tier: 'generic', manufacturer: 'Universal Corp', strength: '1% w/w (20g)', dosage_form: 'Cream',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 200, unit_price: 200, wholesale_pack_price: 110, min_stock_alert: 10,
    notes: 'Affordable bioequivalent antifungal cream.'
  });

  const betaId = 'Betamethasone Dipropionate';
  addTemplateMed({
    brand_name: 'Betnovate Cream 0.1% (15g)',
    mol_name: betaId, mol_desc: 'Potent topical corticosteroid for severe inflammatory skin conditions.', mol_class: 'Potent Topical Corticosteroid',
    brand_tier: 'originator', manufacturer: 'GlaxoSmithKline (GSK)', strength: '0.1% w/w', dosage_form: 'Cream',
    category: 'Prescription', form_category: 'Ointments, Creams & Gels', is_prescription_required: 1,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 520, unit_price: 520, wholesale_pack_price: 390, min_stock_alert: 5,
    notes: 'Prescription steroid cream for short-term application.'
  });

  const dicloGelId = 'Diclofenac Diethylamine';
  addTemplateMed({
    brand_name: 'Voltaren Emulgel 1% (30g)',
    mol_name: dicloGelId, mol_desc: 'Topical NSAID gel for local joint, tendon, and muscular pain relief.', mol_class: 'Topical NSAID Analgesic',
    brand_tier: 'originator', manufacturer: 'Haleon / Novartis', strength: '1.16% Diethylamine (1% Diclofenac)', dosage_form: 'Gel',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 780, unit_price: 780, wholesale_pack_price: 580, min_stock_alert: 8,
    notes: 'Deep-penetrating pain relief gel.'
  });
  addTemplateMed({
    brand_name: 'Diclofenac Pain Relief Gel (30g Generic)',
    mol_name: dicloGelId, mol_desc: 'Topical NSAID gel for joint and muscle aches.', mol_class: 'Topical NSAID Analgesic',
    brand_tier: 'generic', manufacturer: 'Elys Chemical', strength: '1% w/w', dosage_form: 'Gel',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 250, unit_price: 250, wholesale_pack_price: 150, min_stock_alert: 10,
    notes: 'Fast-moving generic anti-inflammatory gel.'
  });

  const burnId = 'Silver Sulfadiazine';
  addTemplateMed({
    brand_name: 'Dermazin 1% Burn Cream (50g)',
    mol_name: burnId, mol_desc: 'Broad spectrum topical antibacterial cream for burns and wound infection prophylaxis.', mol_class: 'Topical Antibacterial / Burn Care',
    brand_tier: 'branded_generic', manufacturer: 'Sandoz', strength: '1% w/w (50g)', dosage_form: 'Cream',
    category: 'Prescription', form_category: 'Ointments, Creams & Gels', is_prescription_required: 1,
    unit_name: 'Jar', units_per_pack: 1, units_per_strip: 1,
    pack_price: 850, unit_price: 850, wholesale_pack_price: 620, min_stock_alert: 4,
    notes: 'Standard hospital burn dressing cream.'
  });

  const tripleAntId = 'Bacitracin + Neomycin + Polymyxin B';
  addTemplateMed({
    brand_name: 'Triple Antibiotic First Aid Ointment (15g)',
    mol_name: tripleAntId, mol_desc: 'Triple antibiotic combination preventing infection in minor cuts, scrapes, and burns.', mol_class: 'Topical Antibiotic',
    brand_tier: 'generic', manufacturer: 'Apex Health', strength: 'Bacitracin/Neomycin/Polymyxin', dosage_form: 'Ointment',
    category: 'OTC', form_category: 'Ointments, Creams & Gels', is_prescription_required: 0,
    unit_name: 'Tube', units_per_pack: 1, units_per_strip: 1,
    pack_price: 320, unit_price: 320, wholesale_pack_price: 210, min_stock_alert: 10,
    notes: 'Essential OTC wound healing ointment.'
  });

  // ─── 2. Syrups & Oral Suspensions ─────────────────────────────────────────
  const amoxSyrId = 'Amoxicillin Paediatric Suspension';
  addTemplateMed({
    brand_name: 'Amoxil Paediatric Suspension 125mg/5ml (100ml)',
    mol_name: amoxSyrId, mol_desc: 'Oral antibacterial dry powder suspension for paediatric bacterial infections.', mol_class: 'Antibacterial / Penicillin',
    brand_tier: 'originator', manufacturer: 'GlaxoSmithKline (GSK)', strength: '125mg / 5ml (100ml bottle)', dosage_form: 'Suspension',
    category: 'Prescription', form_category: 'Syrups & Suspensions', is_prescription_required: 1,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 450, unit_price: 450, wholesale_pack_price: 320, min_stock_alert: 8,
    notes: 'Reconstitute with boiled and cooled water. Discard after 7 days.'
  });
  addTemplateMed({
    brand_name: 'Amoxicillin Dry Syrup 125mg/5ml Generic (100ml)',
    mol_name: amoxSyrId, mol_desc: 'Oral antibacterial powder for suspension in children.', mol_class: 'Antibacterial / Penicillin',
    brand_tier: 'generic', manufacturer: 'Laboratory & Allied', strength: '125mg / 5ml (100ml)', dosage_form: 'Suspension',
    category: 'Prescription', form_category: 'Syrups & Suspensions', is_prescription_required: 1,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 180, unit_price: 180, wholesale_pack_price: 110, min_stock_alert: 12,
    notes: 'High-volume paediatric antibiotic suspension.'
  });

  const paraSyrId = 'Paracetamol Paediatric Liquid';
  addTemplateMed({
    brand_name: 'Calpol Infant Suspension 120mg/5ml (60ml)',
    mol_name: paraSyrId, mol_desc: 'Gentle pain and fever relief for infants and young children.', mol_class: 'Analgesic & Antipyretic',
    brand_tier: 'originator', manufacturer: 'Haleon / J&J', strength: '120mg / 5ml (60ml bottle)', dosage_form: 'Suspension',
    category: 'OTC', form_category: 'Syrups & Suspensions', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 380, unit_price: 380, wholesale_pack_price: 280, min_stock_alert: 10,
    notes: 'Strawberry flavoured oral infant suspension.'
  });
  addTemplateMed({
    brand_name: 'Paracetamol Paediatric Syrup 120mg/5ml Generic (60ml)',
    mol_name: paraSyrId, mol_desc: 'Paediatric fever and pain reducing oral liquid.', mol_class: 'Analgesic & Antipyretic',
    brand_tier: 'generic', manufacturer: 'Regal Pharma', strength: '120mg / 5ml (60ml)', dosage_form: 'Syrup',
    category: 'OTC', form_category: 'Syrups & Suspensions', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 120, unit_price: 120, wholesale_pack_price: 70, min_stock_alert: 15,
    notes: 'Everyday affordable fever relief syrup.'
  });

  const coughId = 'Diphenhydramine + Ammonium Chloride';
  addTemplateMed({
    brand_name: 'Benylin Expectorant Cough Syrup (100ml)',
    mol_name: coughId, mol_desc: 'Expectorant and decongestant cough formula for productive chesty coughs.', mol_class: 'Antitussive / Expectorant',
    brand_tier: 'originator', manufacturer: 'Kenvue / J&J', strength: '14mg/135mg per 5ml', dosage_form: 'Syrup',
    category: 'OTC', form_category: 'Syrups & Suspensions', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 480, unit_price: 480, wholesale_pack_price: 360, min_stock_alert: 8,
    notes: 'Fast-acting relief for chesty coughs.'
  });

  const antacidId = 'Magnesium Hydroxide + Aluminium Hydroxide';
  addTemplateMed({
    brand_name: 'Gelusil MPS Antacid Suspension (200ml)',
    mol_name: antacidId, mol_desc: 'Dual antacid with antiflatulent for heartburn, gastritis, and indigestion.', mol_class: 'Antacid & Antiflatulent',
    brand_tier: 'branded_generic', manufacturer: 'Pfizer', strength: 'Combined Antacid Gel', dosage_form: 'Suspension',
    category: 'OTC', form_category: 'Syrups & Suspensions', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 350, unit_price: 350, wholesale_pack_price: 240, min_stock_alert: 8,
    notes: 'Take 2 teaspoonfuls after meals and at bedtime.'
  });

  const zincId = 'Zinc Sulphate Paediatric';
  addTemplateMed({
    brand_name: 'Zinc Sulphate 20mg/5ml Paediatric Syrup (100ml)',
    mol_name: zincId, mol_desc: 'WHO-recommended adjunct therapy in the management of acute diarrhoea in children.', mol_class: 'Trace Mineral / Diarrhoea Adjunct',
    brand_tier: 'generic', manufacturer: 'Elys Chemical', strength: '20mg / 5ml (100ml)', dosage_form: 'Syrup',
    category: 'OTC', form_category: 'Syrups & Suspensions', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 150, unit_price: 150, wholesale_pack_price: 85, min_stock_alert: 10,
    notes: 'Administer for 10-14 days alongside ORS hydration.'
  });

  // ─── 3. Eye, Ear & Nasal Drops / Sprays ────────────────────────────────────
  const chlorId = 'Chloramphenicol Ophthalmic';
  addTemplateMed({
    brand_name: 'Chloramphenicol 0.5% Eye Drops (10ml)',
    mol_name: chlorId, mol_desc: 'Broad spectrum antibacterial eye drops for acute bacterial conjunctivitis.', mol_class: 'Ophthalmic Antibacterial',
    brand_tier: 'generic', manufacturer: 'Surgipharm', strength: '0.5% w/v (10ml)', dosage_form: 'Eye Drops',
    category: 'Prescription', form_category: 'Eye & Ear Drops', is_prescription_required: 1,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 180, unit_price: 180, wholesale_pack_price: 110, min_stock_alert: 10,
    notes: 'Keep refrigerated between 2°C and 8°C.'
  });

  const ciproDropId = 'Ciprofloxacin Ophthalmic / Otic';
  addTemplateMed({
    brand_name: 'Ciloxan 0.3% Eye/Ear Drops (5ml)',
    mol_name: ciproDropId, mol_desc: 'Fluoroquinolone drops for bacterial corneal ulcers and acute otitis externa.', mol_class: 'Fluoroquinolone Drops',
    brand_tier: 'originator', manufacturer: 'Novartis / Alcon', strength: '0.3% w/v (5ml)', dosage_form: 'Eye Drops',
    category: 'Prescription', form_category: 'Eye & Ear Drops', is_prescription_required: 1,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 680, unit_price: 680, wholesale_pack_price: 490, min_stock_alert: 5,
    notes: 'Sterile ophthalmic/otic solution.'
  });
  addTemplateMed({
    brand_name: 'Ciprofloxacin 0.3% Otic/Ophthalmic Generic (10ml)',
    mol_name: ciproDropId, mol_desc: 'Bacterial ear and eye infection drops.', mol_class: 'Fluoroquinolone Drops',
    brand_tier: 'generic', manufacturer: 'FDC Labs', strength: '0.3% w/v (10ml)', dosage_form: 'Eye Drops',
    category: 'Prescription', form_category: 'Eye & Ear Drops', is_prescription_required: 1,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 220, unit_price: 220, wholesale_pack_price: 140, min_stock_alert: 8,
    notes: 'Affordable dual eye and ear drops.'
  });

  const tearsId = 'Carboxymethylcellulose / Artificial Tears';
  addTemplateMed({
    brand_name: 'Refresh Tears Lubricant Eye Drops (15ml)',
    mol_name: tearsId, mol_desc: 'Lubricating eye drops providing soothing relief from dry, irritated, and burning eyes.', mol_class: 'Ocular Lubricant',
    brand_tier: 'originator', manufacturer: 'Allergan / AbbVie', strength: '0.5% w/v (15ml)', dosage_form: 'Eye Drops',
    category: 'OTC', form_category: 'Eye & Ear Drops', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 890, unit_price: 890, wholesale_pack_price: 680, min_stock_alert: 5,
    notes: 'Premium soothing dry eye relief.'
  });

  const nasalId = 'Xylometazoline Hydrochloride';
  addTemplateMed({
    brand_name: 'Otrivin Adult 0.1% Nasal Drops (10ml)',
    mol_name: nasalId, mol_desc: 'Fast decongestant spray relieving blocked sinuses, cold, and allergic rhinitis.', mol_class: 'Nasal Decongestant',
    brand_tier: 'originator', manufacturer: 'Haleon / GSK', strength: '0.1% w/v (10ml)', dosage_form: 'Nasal Spray',
    category: 'OTC', form_category: 'Eye & Ear Drops', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 420, unit_price: 420, wholesale_pack_price: 310, min_stock_alert: 8,
    notes: 'Fast relief within 2 minutes. Do not use for more than 7 consecutive days.'
  });
  addTemplateMed({
    brand_name: 'Otrivin Paediatric 0.05% Drops (10ml)',
    mol_name: nasalId, mol_desc: 'Gentle nasal decongestant formulated for infants and young children.', mol_class: 'Nasal Decongestant',
    brand_tier: 'originator', manufacturer: 'Haleon / GSK', strength: '0.05% w/v (10ml)', dosage_form: 'Nasal Spray',
    category: 'OTC', form_category: 'Eye & Ear Drops', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 440, unit_price: 440, wholesale_pack_price: 320, min_stock_alert: 6,
    notes: 'For children aged 1-11 years.'
  });

  // ─── 4. Inhalers & Sprays ─────────────────────────────────────────────────
  const salbutId = 'Salbutamol Inhaler';
  addTemplateMed({
    brand_name: 'Ventolin Evohaler 100mcg (200 Doses)',
    mol_name: salbutId, mol_desc: 'Short-acting selective beta-2 adrenergic agonist bronchodilator for asthma attacks.', mol_class: 'SABA Bronchodilator',
    brand_tier: 'originator', manufacturer: 'GlaxoSmithKline (GSK)', strength: '100mcg / actuation (200 doses)', dosage_form: 'Inhaler',
    category: 'Prescription', form_category: 'Inhalers & Sprays', is_prescription_required: 1,
    unit_name: 'Canister', units_per_pack: 1, units_per_strip: 1,
    pack_price: 750, unit_price: 750, wholesale_pack_price: 550, min_stock_alert: 10,
    notes: 'CFC-free metered dose inhaler for rapid asthma rescue.'
  });
  addTemplateMed({
    brand_name: 'Asthalin Inhaler 100mcg (200 Doses Generic)',
    mol_name: salbutId, mol_desc: 'Bioequivalent salbutamol rescue inhaler for bronchospasm relief.', mol_class: 'SABA Bronchodilator',
    brand_tier: 'generic', manufacturer: 'Cipla Ltd', strength: '100mcg / actuation (200 doses)', dosage_form: 'Inhaler',
    category: 'Prescription', form_category: 'Inhalers & Sprays', is_prescription_required: 1,
    unit_name: 'Canister', units_per_pack: 1, units_per_strip: 1,
    pack_price: 480, unit_price: 480, wholesale_pack_price: 340, min_stock_alert: 10,
    notes: 'Widely prescribed generic rescue inhaler.'
  });

  const becloId = 'Beclomethasone Inhaler';
  addTemplateMed({
    brand_name: 'Beclate 100mcg Inhaler (200 Doses)',
    mol_name: becloId, mol_desc: 'Inhaled prophylactic corticosteroid controller reducing airway swelling.', mol_class: 'Inhaled Corticosteroid (ICS)',
    brand_tier: 'branded_generic', manufacturer: 'Cipla Ltd', strength: '100mcg / dose (200 actuations)', dosage_form: 'Inhaler',
    category: 'Prescription', form_category: 'Inhalers & Sprays', is_prescription_required: 1,
    unit_name: 'Canister', units_per_pack: 1, units_per_strip: 1,
    pack_price: 850, unit_price: 850, wholesale_pack_price: 630, min_stock_alert: 5,
    notes: 'Preventer inhaler. Rinse mouth after each use.'
  });

  // ─── 5. Injections & Infusions ────────────────────────────────────────────
  const ceftriaId = 'Ceftriaxone Sodium Injection';
  addTemplateMed({
    brand_name: 'Rocephin 1g IM/IV Injection (Vial)',
    mol_name: ceftriaId, mol_desc: 'Potent broad-spectrum 3rd generation cephalosporin for severe bacterial infections.', mol_class: 'Cephalosporin IV/IM',
    brand_tier: 'originator', manufacturer: 'Roche Diagnostics', strength: '1g Powder for Injection + Solvent', dosage_form: 'Injection',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Vial', units_per_pack: 1, units_per_strip: 1,
    pack_price: 1200, unit_price: 1200, wholesale_pack_price: 900, min_stock_alert: 5,
    notes: 'Reconstitute with 1% lidocaine for IM, or water for injection for IV.'
  });
  addTemplateMed({
    brand_name: 'Ceftriaxone 1g Injection Generic (Vial)',
    mol_name: ceftriaId, mol_desc: 'Injectable cephalosporin antibiotic.', mol_class: 'Cephalosporin IV/IM',
    brand_tier: 'generic', manufacturer: 'Medochemie', strength: '1g Powder for Injection', dosage_form: 'Injection',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Vial', units_per_pack: 1, units_per_strip: 1,
    pack_price: 350, unit_price: 350, wholesale_pack_price: 220, min_stock_alert: 10,
    notes: 'Hospital and emergency clinic antibiotic vial.'
  });

  const dicloInjId = 'Diclofenac Sodium Injection';
  addTemplateMed({
    brand_name: 'Voltaren 75mg/3ml Ampoules (Box of 5)',
    mol_name: dicloInjId, mol_desc: 'Rapid intramuscular NSAID injection for acute renal colic, post-op, and severe pain.', mol_class: 'Injectable NSAID Analgesic',
    brand_tier: 'originator', manufacturer: 'Novartis', strength: '75mg / 3ml (Pack of 5)', dosage_form: 'Injection',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Box', units_per_pack: 5, units_per_strip: 1,
    pack_price: 650, strip_price: 650, unit_price: 130, wholesale_pack_price: 450, min_stock_alert: 5,
    notes: 'Deep intragluteal injection only.'
  });
  addTemplateMed({
    brand_name: 'Diclofenac 75mg/3ml Ampoules Generic (Box of 10)',
    mol_name: dicloInjId, mol_desc: 'Injectable analgesic ampoules.', mol_class: 'Injectable NSAID Analgesic',
    brand_tier: 'generic', manufacturer: 'Dawa Ltd', strength: '75mg / 3ml (Pack of 10)', dosage_form: 'Injection',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Box', units_per_pack: 10, units_per_strip: 1,
    pack_price: 450, strip_price: 450, unit_price: 45, wholesale_pack_price: 280, min_stock_alert: 5,
    notes: 'Affordable high-potency pain relief ampoules.'
  });

  const salineId = 'Sodium Chloride 0.9% IV';
  addTemplateMed({
    brand_name: 'Normal Saline 0.9% IV Infusion (500ml)',
    mol_name: salineId, mol_desc: 'Sterile isotonic intravenous crystalloid solution for fluid resuscitation.', mol_class: 'IV Crystalloid Infusion',
    brand_tier: 'generic', manufacturer: 'B. Braun / Dawa', strength: '0.9% w/v (500ml bag)', dosage_form: 'Infusion',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Bag', units_per_pack: 1, units_per_strip: 1,
    pack_price: 220, unit_price: 220, wholesale_pack_price: 130, min_stock_alert: 10,
    notes: 'Sterile nonpyrogenic fluid for intravenous infusion.'
  });
  const dextroseId = 'Dextrose 5% IV';
  addTemplateMed({
    brand_name: 'Dextrose 5% in Water IV Infusion (500ml)',
    mol_name: dextroseId, mol_desc: 'Isotonic carbohydrate fluid for rehydration and maintenance calories.', mol_class: 'IV Crystalloid Infusion',
    brand_tier: 'generic', manufacturer: 'B. Braun / Dawa', strength: '5% w/v (500ml bag)', dosage_form: 'Infusion',
    category: 'Prescription', form_category: 'Injections & Infusions', is_prescription_required: 1,
    unit_name: 'Bag', units_per_pack: 1, units_per_strip: 1,
    pack_price: 240, unit_price: 240, wholesale_pack_price: 140, min_stock_alert: 8,
    notes: 'Sterile IV sugar fluid infusion.'
  });

  // ─── 6. Medical Supplies & First Aid ──────────────────────────────────────
  const glovesId = 'Surgical Examination Gloves';
  addTemplateMed({
    brand_name: 'Latex Examination Gloves Powder-Free (Box of 100)',
    mol_name: glovesId, mol_desc: 'Single-use non-sterile medical examination gloves for hygienic patient handling.', mol_class: 'Infection Control & PPE',
    brand_tier: 'generic', manufacturer: 'Top Glove / MedSupplies', strength: 'Medium Size (100 Gloves)', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Box', units_per_pack: 100, units_per_strip: 10,
    pack_price: 750, strip_price: 100, unit_price: 7.50, wholesale_pack_price: 520, min_stock_alert: 10,
    notes: 'Textured fingertips for enhanced grip.'
  });

  const syringeId = 'Disposable Syringes & Needles';
  addTemplateMed({
    brand_name: 'Disposable Syringes 5ml with 21G Needle (Box of 100)',
    mol_name: syringeId, mol_desc: 'Sterile 3-part disposable syringe with bevel needle.', mol_class: 'Medication Administration',
    brand_tier: 'generic', manufacturer: 'BD / Global Med', strength: '5ml Syringe + 21G Needle', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Box', units_per_pack: 100, units_per_strip: 10,
    pack_price: 850, strip_price: 120, unit_price: 8.50, wholesale_pack_price: 590, min_stock_alert: 5,
    notes: 'Single use only. Non-toxic, non-pyrogenic.'
  });

  const cottonId = 'Cotton Wool & Dressing';
  addTemplateMed({
    brand_name: 'Absorbent Cotton Wool BP (500g Roll)',
    mol_name: cottonId, mol_desc: 'Pure 100% medical grade absorbent cotton for surgical cleansing and dressings.', mol_class: 'Wound Care & Dressing',
    brand_tier: 'generic', manufacturer: 'Crown Healthcare', strength: '500g Roll', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Roll', units_per_pack: 1, units_per_strip: 1,
    pack_price: 450, unit_price: 450, wholesale_pack_price: 310, min_stock_alert: 8,
    notes: 'High absorbency bleached surgical cotton.'
  });
  addTemplateMed({
    brand_name: 'Conforming Gauze Bandage 7.5cm x 4.5m (Pack of 12)',
    mol_name: cottonId, mol_desc: 'Breathable, elastic gauze roller bandages for securing dressings.', mol_class: 'Wound Care & Dressing',
    brand_tier: 'generic', manufacturer: 'Universal Care', strength: '7.5cm x 4.5m (Pack of 12)', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Pack', units_per_pack: 12, units_per_strip: 1,
    pack_price: 360, unit_price: 30, wholesale_pack_price: 230, min_stock_alert: 5,
    notes: 'Non-fraying elastic wound support bandage.'
  });

  const spiritId = 'Antiseptic Solutions';
  addTemplateMed({
    brand_name: 'Surgical Methylated Spirit 70% (500ml)',
    mol_name: spiritId, mol_desc: 'Hospital disinfectant for skin disinfection prior to injections.', mol_class: 'Skin Antiseptic & Disinfectant',
    brand_tier: 'generic', manufacturer: 'Elys Healthcare', strength: '70% v/v (500ml bottle)', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 280, unit_price: 280, wholesale_pack_price: 180, min_stock_alert: 10,
    notes: 'Flammable liquid for external use only.'
  });
  addTemplateMed({
    brand_name: 'Povidone Iodine Antiseptic Solution 10% (100ml)',
    mol_name: spiritId, mol_desc: 'Broad spectrum topical microbicide for cutaneous antiseptic cleaning and cuts.', mol_class: 'Skin Antiseptic & Disinfectant',
    brand_tier: 'branded_generic', manufacturer: 'Mundipharma / Generic', strength: '10% w/v (100ml)', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Bottle', units_per_pack: 1, units_per_strip: 1,
    pack_price: 320, unit_price: 320, wholesale_pack_price: 220, min_stock_alert: 8,
    notes: 'Standard Betadine gold antiseptic formulation.'
  });

  const diagId = 'Diagnostic Test Consumables';
  addTemplateMed({
    brand_name: 'Blood Glucose Test Strips (Box of 50)',
    mol_name: diagId, mol_desc: 'Electrochemical biosensor test strips for quantitative blood glucose monitoring.', mol_class: 'Point-of-Care Diagnostics',
    brand_tier: 'branded_generic', manufacturer: 'On-Call Plus / Roche', strength: '50 Strips + Code Chip', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Box', units_per_pack: 50, units_per_strip: 1,
    pack_price: 1500, unit_price: 30, wholesale_pack_price: 1150, min_stock_alert: 5,
    notes: 'Fast 5-second test with tiny 0.5µL sample size.'
  });
  addTemplateMed({
    brand_name: 'Digital Clinical Thermometer',
    mol_name: diagId, mol_desc: 'Fast, accurate digital body temperature thermometer with fever alarm and beeper.', mol_class: 'Point-of-Care Diagnostics',
    brand_tier: 'generic', manufacturer: 'Omron / MedTech', strength: 'Accurate to ±0.1°C', dosage_form: 'Medical Supply',
    category: 'OTC', form_category: 'Medical Supplies', is_prescription_required: 0,
    unit_name: 'Piece', units_per_pack: 1, units_per_strip: 1,
    pack_price: 350, unit_price: 350, wholesale_pack_price: 220, min_stock_alert: 5,
    notes: 'Waterproof with memory recall of last reading.'
  });

  // ─── 7. Additional Essential Oral Tablets ──────────────────────────────────
  const ciproMolId = 'Ciprofloxacin Hydrochloride';
  addTemplateMed({
    brand_name: 'Ciproxin 500mg',
    mol_name: ciproMolId, mol_desc: 'Broad-spectrum fluoroquinolone antibiotic for severe UTI, GI and respiratory infections.', mol_class: 'Fluoroquinolone Antibacterial',
    brand_tier: 'originator', manufacturer: 'Bayer Healthcare', strength: '500mg', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 10, units_per_strip: 10,
    pack_price: 850, strip_price: 850, unit_price: 85, wholesale_pack_price: 640, min_stock_alert: 5,
    notes: 'Take with plenty of fluid. Avoid antacids within 2 hours.'
  });
  addTemplateMed({
    brand_name: 'Ciprofloxacin 500mg Generic',
    mol_name: ciproMolId, mol_desc: 'Affordable bioequivalent fluoroquinolone antibacterial.', mol_class: 'Fluoroquinolone Antibacterial',
    brand_tier: 'generic', manufacturer: 'MedPharma Generics', strength: '500mg', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 100, units_per_strip: 10,
    pack_price: 600, strip_price: 70, unit_price: 7, wholesale_pack_price: 400, min_stock_alert: 15,
    notes: 'Hospital bulk dispense tablets.'
  });

  const azithMolId = 'Azithromycin Dihydrate';
  addTemplateMed({
    brand_name: 'Zithromax 500mg (3 Tablets)',
    mol_name: azithMolId, mol_desc: 'Macrolide antibiotic 3-day short course for respiratory and soft tissue infections.', mol_class: 'Macrolide Antibacterial',
    brand_tier: 'originator', manufacturer: 'Pfizer', strength: '500mg (Pack of 3)', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 3, units_per_strip: 3,
    pack_price: 950, strip_price: 950, unit_price: 316.60, wholesale_pack_price: 720, min_stock_alert: 5,
    notes: 'Innovator 3-day once-daily regimen.'
  });
  addTemplateMed({
    brand_name: 'Azithromycin 500mg Generic (3 Tablets)',
    mol_name: azithMolId, mol_desc: 'Generic macrolide antibiotic 3-day treatment.', mol_class: 'Macrolide Antibacterial',
    brand_tier: 'generic', manufacturer: 'Cipla Ltd', strength: '500mg (Pack of 3)', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 3, units_per_strip: 3,
    pack_price: 350, strip_price: 350, unit_price: 116.60, wholesale_pack_price: 220, min_stock_alert: 10,
    notes: 'Cost-effective community antibiotic.'
  });

  const ibupMolId = 'Ibuprofen';
  addTemplateMed({
    brand_name: 'Brufen 400mg',
    mol_name: ibupMolId, mol_desc: 'Standard non-steroidal anti-inflammatory drug (NSAID) for pain, fever, and inflammation.', mol_class: 'NSAID Analgesic',
    brand_tier: 'originator', manufacturer: 'Abbott Healthcare', strength: '400mg', dosage_form: 'Tablet',
    category: 'OTC', form_category: 'Tablets & Capsules', is_prescription_required: 0,
    unit_name: 'Tablet', units_per_pack: 30, units_per_strip: 10,
    pack_price: 450, strip_price: 160, unit_price: 16, wholesale_pack_price: 320, min_stock_alert: 10,
    notes: 'Take strictly after meals with water.'
  });
  addTemplateMed({
    brand_name: 'Ibuprofen 400mg Generic',
    mol_name: ibupMolId, mol_desc: 'Everyday anti-inflammatory and pain relief tablets.', mol_class: 'NSAID Analgesic',
    brand_tier: 'generic', manufacturer: 'Dawa Ltd', strength: '400mg', dosage_form: 'Tablet',
    category: 'OTC', form_category: 'Tablets & Capsules', is_prescription_required: 0,
    unit_name: 'Tablet', units_per_pack: 100, units_per_strip: 10,
    pack_price: 300, strip_price: 35, unit_price: 3.50, wholesale_pack_price: 180, min_stock_alert: 20,
    notes: 'Bulk pharmacy dispensing pack.'
  });

  const amlodMolId = 'Amlodipine Besylate';
  addTemplateMed({
    brand_name: 'Norvasc 5mg',
    mol_name: amlodMolId, mol_desc: 'Dihydropyridine calcium channel blocker for essential hypertension and chronic angina.', mol_class: 'Antihypertensive / CCB',
    brand_tier: 'originator', manufacturer: 'Pfizer', strength: '5mg', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 30, units_per_strip: 10,
    pack_price: 1100, strip_price: 390, unit_price: 39, wholesale_pack_price: 820, min_stock_alert: 6,
    notes: 'Once daily blood pressure control.'
  });
  addTemplateMed({
    brand_name: 'Amlodipine 5mg Generic',
    mol_name: amlodMolId, mol_desc: 'Long-term maintenance medication for hypertension.', mol_class: 'Antihypertensive / CCB',
    brand_tier: 'generic', manufacturer: 'Micro Labs', strength: '5mg', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 30, units_per_strip: 10,
    pack_price: 300, strip_price: 110, unit_price: 11, wholesale_pack_price: 190, min_stock_alert: 10,
    notes: 'Affordable chronic prescription refill.'
  });

  const malarMolId = 'Artemether + Lumefantrine';
  addTemplateMed({
    brand_name: 'Coartem 20/120mg (24s Adult)',
    mol_name: malarMolId, mol_desc: 'First-line Artemisinin-based Combination Therapy (ACT) for uncomplicated falciparum malaria.', mol_class: 'ACT Antimalarial',
    brand_tier: 'originator', manufacturer: 'Novartis', strength: '20mg/120mg (24 Tablets)', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 24, units_per_strip: 6,
    pack_price: 650, strip_price: 170, unit_price: 28, wholesale_pack_price: 480, min_stock_alert: 8,
    notes: 'Full 3-day adult 6-dose treatment course. Take with food or milk.'
  });
  addTemplateMed({
    brand_name: 'Lumartem 20/120mg (24s Adult)',
    mol_name: malarMolId, mol_desc: 'WHO-prequalified artemether/lumefantrine antimalarial combination.', mol_class: 'ACT Antimalarial',
    brand_tier: 'branded_generic', manufacturer: 'Cipla Ltd', strength: '20mg/120mg (24 Tablets)', dosage_form: 'Tablet',
    category: 'Prescription', form_category: 'Tablets & Capsules', is_prescription_required: 1,
    unit_name: 'Tablet', units_per_pack: 24, units_per_strip: 6,
    pack_price: 380, strip_price: 100, unit_price: 16, wholesale_pack_price: 260, min_stock_alert: 12,
    notes: 'Affordable frontline ACT treatment.'
  });

  // Veterinary & Animal Health Templates
  const vetAlbMol = 'Albendazole (Veterinary)';
  addTemplateMed({
    brand_name: 'Albendazole 2500mg Bolus (Vet)',
    mol_name: vetAlbMol, mol_desc: 'Broad-spectrum veterinary anthelmintic for cattle, sheep, and goats.', mol_class: 'Veterinary Anthelmintic',
    brand_tier: 'generic', manufacturer: 'Norbrook Laboratories', strength: '2500mg Bolus', dosage_form: 'Bolus / Tablet',
    category: 'OTC', form_category: 'Veterinary & Animal Health', is_prescription_required: 0,
    unit_name: 'Bolus', units_per_pack: 50, units_per_strip: 5,
    pack_price: 1800, strip_price: 200, unit_price: 45, wholesale_pack_price: 1350, min_stock_alert: 5,
    notes: 'For gastrointestinal roundworms, lungworms, and liver flukes in livestock.'
  });

  const vetOxyMol = 'Oxytetracycline 20% L.A.';
  addTemplateMed({
    brand_name: 'Oxytetracycline 20% L.A. 100ml (Vet)',
    mol_name: vetOxyMol, mol_desc: 'Long-acting injectable broad-spectrum veterinary antibiotic.', mol_class: 'Veterinary Antibiotic',
    brand_tier: 'branded_generic', manufacturer: 'Bimeda Animal Health', strength: '200mg/ml (100ml Vial)', dosage_form: 'Injection / Infusion',
    category: 'Prescription', form_category: 'Veterinary & Animal Health', is_prescription_required: 1,
    unit_name: 'Vial', units_per_pack: 1, units_per_strip: 1,
    pack_price: 850, strip_price: 850, unit_price: 850, wholesale_pack_price: 620, min_stock_alert: 6,
    notes: 'Single dose long-acting treatment for respiratory and systemic livestock infections.'
  });

  const vetIverMol = 'Ivermectin 1% Injectable';
  addTemplateMed({
    brand_name: 'Ivermectin 1% 50ml Injection (Vet)',
    mol_name: vetIverMol, mol_desc: 'Injectable endectocide for internal and external livestock parasites.', mol_class: 'Veterinary Parasiticide',
    brand_tier: 'generic', manufacturer: 'Twiga Chemicals', strength: '10mg/ml (50ml Vial)', dosage_form: 'Injection / Infusion',
    category: 'Prescription', form_category: 'Veterinary & Animal Health', is_prescription_required: 1,
    unit_name: 'Vial', units_per_pack: 1, units_per_strip: 1,
    pack_price: 950, strip_price: 950, unit_price: 950, wholesale_pack_price: 700, min_stock_alert: 4,
    notes: 'Subcutaneous injection for cattle, sheep, and camels.'
  });
}
