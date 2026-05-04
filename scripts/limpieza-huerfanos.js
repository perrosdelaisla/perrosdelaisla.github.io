#!/usr/bin/env node
// Limpieza de fotos huérfanas en bucket "avistamientos" de Supabase.
//
// Uso:
//   node scripts/limpieza-huerfanos.js              (dry-run, NO borra)
//   node scripts/limpieza-huerfanos.js --confirmar  (pide BORRAR interactivo)
//
// Requisitos: Node 18+ (fetch nativo). Cero dependencias npm.
// Configuración: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en env o .env raíz.

'use strict';

const readline = require('node:readline');
const fs = require('node:fs');
const path = require('node:path');

const BUCKET = 'avistamientos';

// ===== CONFIG =====
function loadEnv() {
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fallback a .env en raíz del repo
  const envPath = path.resolve(__dirname, '..', '.env');
  if ((!url || !key) && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, name, raw] = m;
      const value = raw.replace(/^["']|["']$/g, '');
      if (name === 'SUPABASE_URL' && !url) url = value;
      if (name === 'SUPABASE_SERVICE_ROLE_KEY' && !key) key = value;
    }
  }

  if (!url || !key) {
    console.error('❌ Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.');
    console.error('');
    console.error('Configurá una de estas dos opciones:');
    console.error('  1) Variables de entorno en la shell:');
    console.error('     export SUPABASE_URL="https://vqpdrncugaipfpcmpout.supabase.co"');
    console.error('     export SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."');
    console.error('  2) Archivo .env en la raíz del repo:');
    console.error('     SUPABASE_URL=https://vqpdrncugaipfpcmpout.supabase.co');
    console.error('     SUPABASE_SERVICE_ROLE_KEY=eyJhbG...');
    console.error('');
    console.error('La service_role key se obtiene en Supabase → Settings → API → service_role.');
    console.error('IMPORTANTE: nunca commitees esa key. .env está en .gitignore.');
    process.exit(1);
  }
  return { url: url.replace(/\/+$/, ''), key };
}

// ===== HTTP HELPERS =====
function makeHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
}

async function listBucketFiles(url, headers) {
  // Storage list con paginación (limit 100 por request).
  const all = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })
    });
    if (!res.ok) {
      throw new Error(`Listing bucket falló: ${res.status} ${await res.text()}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  // Filtrar carpetas (id null en Supabase storage indica folder).
  return all.filter(f => f && f.id !== null);
}

async function fetchTable(url, headers, table, select) {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}`, { headers });
  if (!res.ok) {
    throw new Error(`Fetching ${table} falló: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function deleteFile(url, headers, name) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers
  });
  return res.ok;
}

// ===== EXTRACCIÓN DE PATHS =====
function extractPath(value) {
  if (!value || typeof value !== 'string') return null;
  // URL completa con bucket: ...storage/v1/object/{public,sign}/avistamientos/PATH
  const m = value.match(/\/avistamientos\/([^?#]+)$/);
  if (m) return m[1];
  // Si parece URL con dominio pero no es del bucket esperado: ignorar
  if (value.includes('://') || value.startsWith('/')) return null;
  // Path suelto (relativo)
  return value;
}

async function gatherReferencedPaths(url, headers) {
  const paths = new Set();

  // avistamientos.foto + avistamientos.fotos[]
  try {
    const avis = await fetchTable(url, headers, 'avistamientos', 'foto,fotos');
    for (const a of avis) {
      const p = extractPath(a.foto);
      if (p) paths.add(p);
      if (Array.isArray(a.fotos)) {
        for (const f of a.fotos) {
          const pp = extractPath(f);
          if (pp) paths.add(pp);
        }
      }
    }
    console.log(`   ✓ avistamientos: ${avis.length} filas`);
  } catch (e) {
    console.warn(`   ⚠️  avistamientos: ${e.message}`);
  }

  // intercambios.foto (si la tabla existe)
  try {
    const inter = await fetchTable(url, headers, 'intercambios', 'foto');
    for (const i of inter) {
      const p = extractPath(i.foto);
      if (p) paths.add(p);
    }
    console.log(`   ✓ intercambios: ${inter.length} filas`);
  } catch (e) {
    console.log(`   – intercambios: no leída (${e.message.split('\n')[0]})`);
  }

  // usuarios.foto
  try {
    const users = await fetchTable(url, headers, 'usuarios', 'foto');
    for (const u of users) {
      const p = extractPath(u.foto);
      if (p) paths.add(p);
    }
    console.log(`   ✓ usuarios: ${users.length} filas`);
  } catch (e) {
    console.warn(`   ⚠️  usuarios: ${e.message}`);
  }

  // rutas.foto (también guarda en el bucket avistamientos)
  try {
    const rutas = await fetchTable(url, headers, 'rutas', 'foto');
    for (const r of rutas) {
      const p = extractPath(r.foto);
      if (p) paths.add(p);
    }
    console.log(`   ✓ rutas: ${rutas.length} filas`);
  } catch (e) {
    console.log(`   – rutas: no leída (${e.message.split('\n')[0]})`);
  }

  return paths;
}

// ===== INTERACCIÓN =====
function ask(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// ===== FORMATEO =====
function fmtKb(bytes) {
  if (!bytes) return '0 KB';
  return (bytes / 1024).toFixed(1) + ' KB';
}
function fmtMb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
function fmtDate(iso) {
  if (!iso) return '?';
  return new Date(iso).toISOString().slice(0, 10);
}
function pad(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n - 1) + '…' : s.padEnd(n);
}

// ===== MAIN =====
async function main() {
  const args = process.argv.slice(2);
  const confirmar = args.includes('--confirmar');

  console.log('🔍 Cargando configuración...');
  const { url, key } = loadEnv();
  const headers = makeHeaders(key);
  console.log(`   ✓ ${url}`);
  console.log('');

  console.log(`📦 Listando archivos del bucket "${BUCKET}"...`);
  const files = await listBucketFiles(url, headers);
  console.log(`   ${files.length} archivos en bucket.`);
  console.log('');

  console.log('🗂️  Cargando paths referenciados en BD...');
  const referenced = await gatherReferencedPaths(url, headers);
  console.log(`   ${referenced.size} paths únicos referenciados.`);
  console.log('');

  const orphans = files.filter(f => !referenced.has(f.name));

  if (orphans.length === 0) {
    console.log('✅ No hay archivos huérfanos. Bucket limpio.');
    return;
  }

  // Tabla
  console.log(`📋 Archivos huérfanos (${orphans.length}):`);
  console.log('');
  console.log('  ' + pad('NOMBRE', 50) + pad('PESO', 12) + 'FECHA');
  console.log('  ' + '-'.repeat(72));
  let total = 0;
  for (const f of orphans) {
    const size = (f.metadata && f.metadata.size) || 0;
    total += size;
    console.log('  ' + pad(f.name, 50) + pad(fmtKb(size), 12) + fmtDate(f.created_at));
  }
  console.log('  ' + '-'.repeat(72));
  console.log(`  TOTAL: ${orphans.length} archivos · ${fmtMb(total)}`);
  console.log('');

  if (!confirmar) {
    console.log('🔒 Modo dry-run. Para borrar:');
    console.log('   node scripts/limpieza-huerfanos.js --confirmar');
    return;
  }

  const answer = await ask(
    `⚠️  Vas a borrar ${orphans.length} archivos (${fmtMb(total)}).\n   Escribí BORRAR para confirmar: `
  );
  if (answer.trim() !== 'BORRAR') {
    console.log('❌ Cancelado. No se borró nada.');
    return;
  }

  console.log('');
  console.log('🗑️  Borrando uno a uno...');
  let ok = 0;
  let fail = 0;
  for (const f of orphans) {
    try {
      const success = await deleteFile(url, headers, f.name);
      if (success) {
        console.log(`   ✓ ${f.name}`);
        ok++;
      } else {
        console.log(`   ✗ ${f.name} (HTTP error)`);
        fail++;
      }
    } catch (e) {
      console.log(`   ✗ ${f.name} (${e.message})`);
      fail++;
    }
  }
  console.log('');
  console.log(`✅ Completado: ${ok} borrados · ${fail} fallidos.`);
}

main().catch(e => {
  console.error('💥 Error inesperado:', e);
  process.exit(1);
});
