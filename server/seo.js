import { db } from './db.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function registerSeoRoutes(app) {
  // Google Search Console Verification File
  app.get('/google78436fe9f8ffa4a2.html', (req, res) => {
    res.type('text/html').send('google-site-verification: google78436fe9f8ffa4a2.html');
  });

  // 1. Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'pharmahub.onrender.com';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      `Sitemap: ${proto}://${host}/sitemap.xml`
    ].join('\n');
    res.type('text/plain').send(robots);
  });

  // 2. Dynamic sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'pharmahub.onrender.com';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${proto}://${host}`;
    const today = new Date().toISOString().slice(0, 10);

    const medicines = db.prepare('SELECT id, brand_name, strength FROM medicines ORDER BY id ASC').all();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/drugs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    for (const med of medicines) {
      const slug = slugify(`${med.brand_name}-${med.strength}`);
      xml += `
  <url>
    <loc>${baseUrl}/drugs/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += '\n</urlset>';
    res.type('application/xml').send(xml);
  });

  // 3. Public Directory: /drugs
  app.get('/drugs', (req, res) => {
    const host = req.get('host') || 'pharmahub.onrender.com';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${proto}://${host}`;

    const currSetting = db.prepare("SELECT value FROM settings WHERE key = 'currency_symbol'").get();
    const curr = currSetting?.value || 'KSh';

    const meds = db.prepare(`
      SELECT m.*, mol.name as molecule_name, mol.therapeutic_class
      FROM medicines m
      JOIN molecules mol ON m.molecule_id = mol.id
      ORDER BY m.brand_name ASC
    `).all();

    const drugItems = meds.map(m => {
      const slug = slugify(`${m.brand_name}-${m.strength}`);
      const tierBadge = m.brand_tier === 'originator' 
        ? '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;">Originator Brand</span>'
        : m.brand_tier === 'branded_generic'
        ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;">Branded Generic</span>'
        : '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;">Pure Generic</span>';

      return `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:16px 12px;">
            <a href="/drugs/${slug}" style="font-weight:700;color:#0f766e;text-decoration:none;font-size:15px;">${m.brand_name}</a>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">${m.strength} • ${m.dosage_form}</div>
          </td>
          <td style="padding:16px 12px;font-size:13px;color:#334155;">${m.molecule_name}</td>
          <td style="padding:16px 12px;">${tierBadge}</td>
          <td style="padding:16px 12px;font-weight:700;color:#0f172a;text-align:right;">${curr}${Number(m.pack_price).toFixed(2)}</td>
          <td style="padding:16px 12px;text-align:center;">
            <a href="/drugs/${slug}" style="background:#059669;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;display:inline-block;">View Prices</a>
          </td>
        </tr>
      `;
    }).join('');

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Essential Medicines & Generic Alternatives Price Directory — PharmaHub</title>
  <meta name="description" content="Browse verified retail and generic alternative prices for essential medicines in Kenya and globally. Compare brand originator vs generic savings." />
  <link rel="canonical" href="${baseUrl}/drugs" />
  <meta property="og:title" content="Essential Medicines Price Directory — PharmaHub" />
  <meta property="og:description" content="Compare retail medicine prices and bioequivalent generic alternatives with savings calculation." />
  <meta property="og:url" content="${baseUrl}/drugs" />
  <meta name="robots" content="index, follow" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin:0; padding:0; }
    .header { background: #064e3b; color: white; padding: 24px 20px; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    .card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 20px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 12px; background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <a href="/" style="color:#34d399;font-weight:900;text-decoration:none;font-size:20px;">PharmaHub</a>
        <div style="font-size:13px;color:#a7f3d0;margin-top:4px;">National Drug Price & Generic Intelligence Directory</div>
      </div>
      <div>
        <a href="/" style="background:#059669;color:white;padding:8px 16px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;">Open Pharmacy App</a>
      </div>
    </div>
  </div>

  <div class="container">
    <div style="margin-bottom:20px;">
      <h1 style="font-size:26px;color:#0f172a;margin:0 0 8px 0;">Pharmaceutical Price & Bioequivalence Directory</h1>
      <p style="color:#64748b;font-size:14px;margin:0;">Search, compare prices, and identify certified generic alternatives to reduce patient healthcare costs.</p>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Brand & Strength</th>
            <th>Active Molecule</th>
            <th>Pricing Tier</th>
            <th style="text-align:right;">Pack Price</th>
            <th style="text-align:center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${drugItems}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    res.send(html);
  });

  // 4. Individual SEO Drug Page: /drugs/:slug
  app.get('/drugs/:slug', (req, res, next) => {
    const slug = req.params.slug;
    const host = req.get('host') || 'pharmahub.onrender.com';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${proto}://${host}`;

    // Query all medicines to match slug
    const allMeds = db.prepare(`
      SELECT m.*, mol.name as molecule_name, mol.therapeutic_class, mol.description as molecule_description
      FROM medicines m
      JOIN molecules mol ON m.molecule_id = mol.id
    `).all();

    const targetMed = allMeds.find(m => slugify(`${m.brand_name}-${m.strength}`) === slug || slugify(m.brand_name) === slug);

    if (!targetMed) {
      return next(); // Pass to client SPA router
    }

    // Get alternatives for the same molecule
    const alternatives = allMeds.filter(m => m.molecule_id === targetMed.molecule_id);
    const currSetting = db.prepare("SELECT value FROM settings WHERE key = 'currency_symbol'").get();
    const curr = currSetting?.value || 'KSh';

    const originator = alternatives.find(a => a.brand_tier === 'originator') || targetMed;
    const savingsVsOriginator = Math.max(0, originator.pack_price - targetMed.pack_price);
    const savingsPct = originator.pack_price > 0 ? Math.round((savingsVsOriginator / originator.pack_price) * 100) : 0;

    // Structured JSON-LD Schema for Google Rich Snippets
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Drug",
          "name": targetMed.brand_name,
          "activeIngredient": targetMed.molecule_name,
          "dosageForm": targetMed.dosage_form,
          "prescriptionStatus": targetMed.is_prescription_required ? "PrescriptionOnly" : "OTC",
          "description": `${targetMed.brand_name} (${targetMed.strength}) contains active ingredient ${targetMed.molecule_name}. Used for ${targetMed.therapeutic_class}.`,
          "offers": {
            "@type": "Offer",
            "price": targetMed.pack_price,
            "priceCurrency": curr === 'KSh' ? 'KES' : 'USD',
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Drugs Directory", "item": `${baseUrl}/drugs` },
            { "@type": "ListItem", "position": 3, "name": targetMed.brand_name, "item": `${baseUrl}/drugs/${slug}` }
          ]
        }
      ]
    };

    const altRows = alternatives.map(alt => {
      const isCurrent = alt.id === targetMed.id;
      const diff = originator.pack_price - alt.pack_price;
      const pct = originator.pack_price > 0 ? Math.round((diff / originator.pack_price) * 100) : 0;
      return `
        <tr style="border-bottom:1px solid #f1f5f9; ${isCurrent ? 'background:#ecfdf5;' : ''}">
          <td style="padding:14px 12px;font-weight:700;color:${isCurrent ? '#065f46' : '#1e293b'};">
            ${alt.brand_name} ${isCurrent ? '<span style="font-size:11px;background:#10b981;color:white;padding:2px 6px;border-radius:6px;margin-left:6px;">Current</span>' : ''}
            <div style="font-size:11px;color:#64748b;font-weight:normal;">${alt.manufacturer || 'Certified Manufacturer'}</div>
          </td>
          <td style="padding:14px 12px;text-transform:capitalize;font-size:12px;color:#475569;">
            ${alt.brand_tier.replace('_', ' ')}
          </td>
          <td style="padding:14px 12px;font-weight:700;text-align:right;">
            ${curr}${Number(alt.pack_price).toFixed(2)}
          </td>
          <td style="padding:14px 12px;text-align:right;color:${diff > 0 ? '#059669' : '#64748b'};font-weight:bold;font-size:13px;">
            ${diff > 0 ? `Save ${pct}% (${curr}${diff.toFixed(2)})` : 'Baseline'}
          </td>
        </tr>
      `;
    }).join('');

    const pageHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${targetMed.brand_name} (${targetMed.strength}) Price, Uses & Generic Alternatives — PharmaHub</title>
  <meta name="description" content="Check ${targetMed.brand_name} price (${curr}${targetMed.pack_price}), active molecule ${targetMed.molecule_name}, and compare bioequivalent generic alternatives with up to ${savingsPct}% savings." />
  <link rel="canonical" href="${baseUrl}/drugs/${slug}" />
  <meta property="og:title" content="${targetMed.brand_name} Price & Generic Alternatives — PharmaHub" />
  <meta property="og:description" content="Compare ${targetMed.brand_name} prices vs bioequivalent generic medicines. Save up to ${savingsPct}% with generic equivalents." />
  <meta property="og:url" content="${baseUrl}/drugs/${slug}" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">
    ${JSON.stringify(schemaData, null, 2)}
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin:0; padding:0; line-height: 1.5; }
    .header { background: #064e3b; color: white; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06); padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 12px; background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .btn-primary { background: #059669; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div style="max-width:900px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <a href="/" style="color:#34d399;font-weight:900;text-decoration:none;font-size:22px;">PharmaHub</a>
        <div style="font-size:12px;color:#a7f3d0;">Smart Pharmacy OS & Drug Pricing Directory</div>
      </div>
      <div>
        <a href="/" class="btn-primary" style="padding:8px 16px;font-size:13px;">Open PharmaHub</a>
      </div>
    </div>
  </div>

  <div class="container">
    <div style="font-size:12px;color:#64748b;margin-bottom:16px;">
      <a href="/" style="color:#059669;text-decoration:none;">Home</a> &gt; 
      <a href="/drugs" style="color:#059669;text-decoration:none;">Drugs</a> &gt; 
      <span>${targetMed.brand_name}</span>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <span class="badge" style="background:#ecfdf5;color:#065f46;margin-bottom:8px;">${targetMed.therapeutic_class}</span>
          <h1 style="font-size:28px;margin:4px 0 6px 0;color:#0f172a;">${targetMed.brand_name}</h1>
          <div style="color:#475569;font-size:15px;">Active Substance: <strong>${targetMed.molecule_name}</strong> (${targetMed.strength})</div>
          <div style="color:#64748b;font-size:13px;margin-top:4px;">Manufacturer: ${targetMed.manufacturer || 'Standard'} • Form: ${targetMed.dosage_form}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#64748b;">Reference Price</div>
          <div style="font-size:32px;font-weight:900;color:#059669;">${curr}${Number(targetMed.pack_price).toFixed(2)}</div>
          <div style="font-size:11px;color:#94a3b8;">Per Pack of ${targetMed.units_per_pack || 'Standard'} Units</div>
        </div>
      </div>

      ${savingsPct > 0 ? `
      <div style="margin-top:20px;padding:14px 18px;background:#f0fdf4;border-left:4px solid #10b981;border-radius:8px;font-size:14px;color:#166534;">
        💰 <strong>Generic Cost Advantage:</strong> You save <strong>${savingsPct}% (${curr}${savingsVsOriginator.toFixed(2)})</strong> compared to the originator brand (${originator.brand_name}).
      </div>` : ''}
    </div>

    <!-- Alternative Options & Comparison -->
    <div class="card">
      <h2 style="font-size:20px;color:#0f172a;margin:0 0 8px 0;">Bioequivalent Alternatives & Price Comparison</h2>
      <p style="font-size:13px;color:#64748b;margin:0 0 16px 0;">All brands below contain the identical active molecule (<strong>${targetMed.molecule_name}</strong>) and provide identical clinical therapeutic outcomes.</p>

      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Brand Name</th>
              <th>Tier</th>
              <th style="text-align:right;">Pack Price</th>
              <th style="text-align:right;">Savings vs Originator</th>
            </tr>
          </thead>
          <tbody>
            ${altRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pharmacology & Safety -->
    <div class="card">
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 10px 0;">About ${targetMed.molecule_name}</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 12px 0;">${targetMed.molecule_description || 'Essential medication listed on WHO model list of essential medicines.'}</p>
      <div style="background:#fef2f2;border:1px solid #fee2e2;border-radius:12px;padding:12px;font-size:12px;color:#991b1b;">
        ⚠️ <strong>Medical Disclaimer:</strong> Pricing and alternative comparisons are for informational and inventory management reference. Prescription medicines must only be dispensed by a certified pharmacist with a valid doctor's prescription.
      </div>
    </div>

    <!-- Call to action for pharmacists -->
    <div style="background:linear-gradient(135deg, #064e3b, #047857);border-radius:20px;padding:30px;color:white;text-align:center;">
      <h3 style="font-size:22px;margin:0 0 8px 0;">Are you running a pharmacy or chemist?</h3>
      <p style="font-size:14px;color:#a7f3d0;margin:0 auto 20px auto;max-width:600px;">PharmaHub is completely free. Automate your dispensing, track expiry with FEFO, and manage customer credit loans with 1-click WhatsApp reminders.</p>
      <a href="/" style="background:white;color:#064e3b;font-weight:bold;padding:12px 28px;border-radius:12px;text-decoration:none;display:inline-block;">Launch Free Pharmacy Software</a>
    </div>
  </div>
</body>
</html>`;

    res.send(pageHtml);
  });
}
