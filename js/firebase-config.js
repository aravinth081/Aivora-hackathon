/**
 * firebase-config.js — Unified Firebase & Cloudinary Backend Architecture
 * AIVORA 2K26 — Global Online AI Hackathon
 * Organizer: Innovation Hacks | BUILD • INNOVATE • IMPACT
 *
 * Text / Data Backend: Firebase Firestore
 * Image & Asset Storage: Cloudinary (Unsigned Preset: aivora, Cloud: eo67rite, Folder: devloper)
 *
 * Includes dual-persistence fallback (IndexedDB & LocalStorage) for 100% resilient operation.
 */

(function (window) {
  'use strict';

  // ── STORAGE KEYS ──
  const STORAGE_KEY_FIREBASE = 'aivora_firebase_config';
  const STORAGE_KEY_CLOUDINARY = 'aivora_cloudinary_config';

  // ── DEFAULT CONFIGURATIONS (Configured as provided by user) ──
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB2BboJxL1wFVW_b35pxyKjgeLE--VixTA",
    authDomain: "aivora-a13e4.firebaseapp.com",
    projectId: "aivora-a13e4",
    storageBucket: "aivora-a13e4.firebasestorage.app",
    messagingSenderId: "624527403630",
    appId: "1:624527403630:web:b44316b99fcd29256ad47f",
    measurementId: "G-7JNDPXHHWG"
  };

  const DEFAULT_CLOUDINARY_CONFIG = {
    cloudName: "eo67rite",
    uploadPreset: "aivora",
    folder: "devloper"
  };

  let _firebaseApp = null;
  let _firestore = null;

  // ── CONFIG HELPERS ──
  function getFirebaseConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return Object.assign({}, DEFAULT_FIREBASE_CONFIG, parsed);
        }
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_FIREBASE_CONFIG);
  }

  function saveFirebaseConfig(cfg) {
    try {
      if (cfg && typeof cfg === 'object') {
        localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(cfg));
        _firebaseApp = null;
        _firestore = null;
      }
    } catch (e) {}
  }

  function getCloudinaryConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLOUDINARY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.cloudName && parsed.uploadPreset) {
          return Object.assign({}, DEFAULT_CLOUDINARY_CONFIG, parsed);
        }
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_CLOUDINARY_CONFIG);
  }

  function saveCloudinaryConfig(cfg) {
    try {
      if (cfg && typeof cfg === 'object') {
        localStorage.setItem(STORAGE_KEY_CLOUDINARY, JSON.stringify(cfg));
      }
    } catch (e) {}
  }

  // Combined config getter for Admin panel compatibility
  function getConfig() {
    const fb = getFirebaseConfig();
    const cl = getCloudinaryConfig();
    return {
      firebase: fb,
      cloudinary: cl,
      // Compatibility aliases
      url: fb.projectId,
      anonKey: fb.apiKey,
      bucket: cl.cloudName
    };
  }

  function saveConfig(apiKeyOrObj, projectId, cloudName, uploadPreset) {
    if (typeof apiKeyOrObj === 'object') {
      if (apiKeyOrObj.firebase) saveFirebaseConfig(apiKeyOrObj.firebase);
      if (apiKeyOrObj.cloudinary) saveCloudinaryConfig(apiKeyOrObj.cloudinary);
    } else {
      const fb = getFirebaseConfig();
      if (apiKeyOrObj) fb.apiKey = apiKeyOrObj.trim();
      if (projectId) fb.projectId = projectId.trim();
      saveFirebaseConfig(fb);

      const cl = getCloudinaryConfig();
      if (cloudName) cl.cloudName = cloudName.trim();
      if (uploadPreset) cl.uploadPreset = uploadPreset.trim();
      saveCloudinaryConfig(cl);
    }
  }

  // ── FIREBASE INITIALIZATION ──
  function getDb() {
    if (_firestore) return _firestore;

    if (typeof window.firebase === 'undefined') {
      console.warn('Firebase JS SDK not loaded on window.');
      return null;
    }

    try {
      const cfg = getFirebaseConfig();
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        _firebaseApp = window.firebase.initializeApp(cfg);
      } else {
        _firebaseApp = window.firebase.apps[0];
      }
      _firestore = window.firebase.firestore();
      return _firestore;
    } catch (err) {
      console.warn('Firebase initialization notice:', err.message);
      return null;
    }
  }

  function isLive() {
    const cfg = getFirebaseConfig();
    return Boolean(cfg.apiKey && cfg.projectId && typeof window.firebase !== 'undefined');
  }

  function sanitizeDocId(str) {
    if (!str) return 'unknown';
    return String(str).trim().toLowerCase().replace(/[\/\\#\?]/g, '_');
  }

  // ── CLOUDINARY UPLOAD (UNSIGNED PRESET: aivora) ──
  async function uploadToCloudinary(fileOrDataUrl, folderName) {
    const cfg = getCloudinaryConfig();
    const cloudName = cfg.cloudName || 'eo67rite';
    const uploadPreset = cfg.uploadPreset || 'aivora';
    const targetFolder = folderName || cfg.folder || 'devloper';

    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('upload_preset', uploadPreset);
    if (targetFolder) {
      formData.append('folder', targetFolder);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = `Cloudinary upload failed (HTTP ${response.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error && parsed.error.message) msg = parsed.error.message;
      } catch (e) {}
      throw new Error(msg);
    }

    const result = await response.json();
    return result.secure_url || result.url;
  }

  // Alias for compatibility
  async function uploadStorageFile(file, path) {
    return await uploadToCloudinary(file, 'devloper');
  }

  async function deleteStorageFile(path) {
    // Cloudinary unsigned uploads do not support public deletion without signed API secret
    return true;
  }

  // ── PARTICIPANTS (ROSTER & VERIFICATION) ──

  async function getParticipant(rawEmail) {
    if (!rawEmail) return null;
    const email = rawEmail.trim().toLowerCase();
    const db = getDb();

    if (db && isLive()) {
      try {
        const docId = sanitizeDocId(email);
        const snap = await db.collection('participants').doc(docId).get();
        if (snap.exists) {
          const data = snap.data();
          return {
            email: data.email || email,
            name: data.name || '',
            claimed: Boolean(data.claimed),
            claimedAt: data.claimedAt || data.claimed_at || null,
            certId: data.certId || data.cert_id || null
          };
        }
      } catch (e) {
        console.warn('Firebase getParticipant error:', e);
      }
    }

    // Fallback: LocalStorage registered_participants
    try {
      const local = JSON.parse(localStorage.getItem('registered_participants') || '[]');
      const found = local.find(x => x && (typeof x === 'string' ? x : x.email || '').trim().toLowerCase() === email);
      if (found) {
        if (typeof found === 'string') return { email, name: '', claimed: false };
        return {
          email: found.email || email,
          name: found.name || '',
          claimed: Boolean(found.claimed),
          claimedAt: found.claimedAt || null,
          certId: found.certId || null
        };
      }
    } catch (e) {}

    return null;
  }

  async function upsertParticipant(participant) {
    if (!participant || !participant.email) return false;
    const email = participant.email.trim().toLowerCase();
    const name = participant.name || '';
    const claimed = Boolean(participant.claimed);
    const certId = participant.certId || null;
    const claimedAt = participant.claimedAt ? new Date(participant.claimedAt).toISOString() : (claimed ? new Date().toISOString() : null);

    const docData = {
      email,
      name,
      claimed,
      certId,
      claimedAt,
      updatedAt: new Date().toISOString()
    };

    // 1. Sync Firebase Firestore
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('participants').doc(sanitizeDocId(email)).set(docData, { merge: true });
      } catch (e) {
        console.warn('Firebase upsertParticipant error:', e);
      }
    }

    // 2. LocalStorage Sync
    try {
      const local = JSON.parse(localStorage.getItem('registered_participants') || '[]');
      const idx = local.findIndex(x => x && (typeof x === 'string' ? x : x.email || '').trim().toLowerCase() === email);
      const record = { email, name, claimed, certId, claimedAt };
      if (idx >= 0) {
        local[idx] = Object.assign({}, typeof local[idx] === 'object' ? local[idx] : {}, record);
      } else {
        local.push(record);
      }
      localStorage.setItem('registered_participants', JSON.stringify(local));
    } catch (e) {}

    return true;
  }

  async function getAllParticipants() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('participants').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => {
            const d = doc.data();
            list.push({
              email: d.email || doc.id,
              name: d.name || '',
              claimed: Boolean(d.claimed),
              claimedAt: d.claimedAt || d.claimed_at || null,
              certId: d.certId || d.cert_id || null
            });
          });
          if (list.length > 0) return list;
        }
      } catch (e) {
        console.warn('Firebase getAllParticipants error:', e);
      }
    }

    // Fallback: LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem('registered_participants') || '[]');
      return local.map(item => {
        if (typeof item === 'string') return { email: item, name: '', claimed: false };
        return {
          email: item.email || '',
          name: item.name || '',
          claimed: Boolean(item.claimed),
          claimedAt: item.claimedAt || null,
          certId: item.certId || null
        };
      });
    } catch (e) {
      return [];
    }
  }

  async function bulkUpsertParticipants(list) {
    if (!Array.isArray(list) || list.length === 0) return true;
    const db = getDb();

    // 1. Firebase Firestore batch writes (max 450 docs per batch)
    if (db && isLive()) {
      try {
        const CHUNK_SIZE = 450;
        for (let i = 0; i < list.length; i += CHUNK_SIZE) {
          const chunk = list.slice(i, i + CHUNK_SIZE);
          const batch = db.batch();
          chunk.forEach(p => {
            const email = (typeof p === 'string' ? p : p.email).trim().toLowerCase();
            const docRef = db.collection('participants').doc(sanitizeDocId(email));
            batch.set(docRef, {
              email: email,
              name: typeof p === 'string' ? '' : (p.name || ''),
              claimed: typeof p === 'string' ? false : Boolean(p.claimed),
              certId: typeof p === 'string' ? null : (p.certId || null),
              claimedAt: typeof p === 'string' ? null : (p.claimedAt || null),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          });
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase bulkUpsertParticipants error:', e);
      }
    }

    // 2. LocalStorage
    try {
      localStorage.setItem('registered_participants', JSON.stringify(list));
    } catch (e) {}

    return true;
  }

  async function deleteParticipant(rawEmail) {
    if (!rawEmail) return;
    const email = rawEmail.trim().toLowerCase();
    const db = getDb();

    if (db && isLive()) {
      try {
        await db.collection('participants').doc(sanitizeDocId(email)).delete();
      } catch (e) {
        console.warn('Firebase deleteParticipant error:', e);
      }
    }

    try {
      const local = JSON.parse(localStorage.getItem('registered_participants') || '[]');
      const filtered = local.filter(x => x && (typeof x === 'string' ? x : x.email || '').trim().toLowerCase() !== email);
      localStorage.setItem('registered_participants', JSON.stringify(filtered));
    } catch (e) {}
  }

  async function clearAllParticipants() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('participants').get();
        if (!snap.empty) {
          const batch = db.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase clearAllParticipants error:', e);
      }
    }
    try {
      localStorage.removeItem('registered_participants');
    } catch (e) {}
  }

  // ── WINNER CODES & CLAIMS ──

  async function getWinnerCodes() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('winner_codes').get();
        if (!snap.empty) {
          const result = {};
          snap.forEach(doc => {
            const row = doc.data();
            const code = (row.code || doc.id).toUpperCase();
            result[code] = {
              code: code,
              rank: row.rank || 1,
              label: row.label || ('Rank ' + (row.rank || 1)),
              teamName: row.teamName || row.team_name || '',
              maxQuota: row.maxQuota || row.max_quota || 4,
              usedCount: row.usedCount || row.used_count || (row.claimedMembers ? row.claimedMembers.length : 0),
              claimedMembers: row.claimedMembers || row.claimed_members || [],
              tplKey: row.tplKey || row.tpl_key || ('winner' + (row.rank || 1))
            };
          });
          return result;
        }
      } catch (e) {
        console.warn('Firebase getWinnerCodes error:', e);
      }
    }

    try {
      const local = localStorage.getItem('winnerCodes');
      if (local) return JSON.parse(local);
    } catch (e) {}
    return {};
  }

  async function saveWinnerCodes(codesMap) {
    if (!codesMap) return;
    try {
      localStorage.setItem('winnerCodes', JSON.stringify(codesMap));
    } catch (e) {}

    const db = getDb();
    if (db && isLive()) {
      try {
        const keys = Object.keys(codesMap);
        if (keys.length > 0) {
          const batch = db.batch();
          keys.forEach(k => {
            const item = codesMap[k];
            const code = k.toUpperCase();
            const docRef = db.collection('winner_codes').doc(code);
            batch.set(docRef, {
              code: code,
              rank: item.rank || 1,
              label: item.label || ('Rank ' + (item.rank || 1)),
              teamName: item.teamName || '',
              maxQuota: item.maxQuota || item.quota || 4,
              usedCount: item.usedCount || (item.claimedMembers ? item.claimedMembers.length : 0),
              claimedMembers: item.claimedMembers || [],
              tplKey: item.tplKey || ('winner' + (item.rank || 1)),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          });
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase saveWinnerCodes error:', e);
      }
    }
  }

  async function recordWinnerClaim(claim) {
    if (!claim || !claim.certId) return false;
    const db = getDb();

    if (db && isLive()) {
      try {
        const docId = sanitizeDocId(claim.certId);
        await db.collection('winner_claims').doc(docId).set({
          id: docId,
          name: claim.name,
          code: (claim.code || '').toUpperCase(),
          rank: claim.rank || 1,
          rankLabel: claim.rankLabel || claim.label || 'Winner',
          teamName: claim.teamName || '',
          certId: claim.certId,
          type: claim.type || 'winner1',
          date: claim.date || new Date().toLocaleDateString('en-GB'),
          claimedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase recordWinnerClaim error:', e);
      }
    }

    try {
      const claims = JSON.parse(localStorage.getItem('admin_winner_claims') || '[]');
      claims.push(claim);
      localStorage.setItem('admin_winner_claims', JSON.stringify(claims));
    } catch (e) {}
    return true;
  }

  async function getAllWinnerClaims() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('winner_claims').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => {
            const d = doc.data();
            list.push({
              id: doc.id,
              name: d.name,
              code: d.code,
              rank: d.rank,
              rankLabel: d.rankLabel || d.rank_label,
              teamName: d.teamName || d.team_name,
              certId: d.certId || d.cert_id,
              type: d.type,
              date: d.date,
              claimedAt: d.claimedAt || d.claimed_at
            });
          });
          return list;
        }
      } catch (e) {
        console.warn('Firebase getAllWinnerClaims error:', e);
      }
    }
    try {
      return JSON.parse(localStorage.getItem('admin_winner_claims') || '[]');
    } catch (e) {
      return [];
    }
  }

  async function deleteWinnerClaim(claimId) {
    if (!claimId) return;
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('winner_claims').doc(sanitizeDocId(claimId)).delete();
      } catch (e) {
        console.warn('Firebase deleteWinnerClaim error:', e);
      }
    }
  }

  async function clearWinnerClaims() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('winner_claims').get();
        if (!snap.empty) {
          const batch = db.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase clearWinnerClaims error:', e);
      }
    }
  }

  // ── JUDGE CODES & CERTS ──

  async function getJudgeCodes() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('judge_codes').get();
        if (!snap.empty) {
          const result = {};
          snap.forEach(doc => {
            const r = doc.data();
            const code = (r.code || doc.id).toUpperCase();
            result[code] = {
              code: code,
              name: r.name || '',
              role: r.role || 'Judge & Evaluator',
              event: r.event || 'AIVORA 2K26',
              maxQuota: r.maxQuota || r.max_quota || 1,
              usedCount: r.usedCount || r.used_count || 0,
              claimedMembers: r.claimedMembers || r.claimed_members || []
            };
          });
          return result;
        }
      } catch (e) {
        console.warn('Firebase getJudgeCodes error:', e);
      }
    }
    try {
      const local = localStorage.getItem('judgeCodes');
      if (local) return JSON.parse(local);
    } catch (e) {}
    return {};
  }

  async function saveJudgeCodes(codesMap) {
    if (!codesMap) return;
    try {
      localStorage.setItem('judgeCodes', JSON.stringify(codesMap));
    } catch (e) {}

    const db = getDb();
    if (db && isLive()) {
      try {
        const keys = Object.keys(codesMap);
        if (keys.length > 0) {
          const batch = db.batch();
          keys.forEach(k => {
            const item = codesMap[k];
            const code = k.toUpperCase();
            const docRef = db.collection('judge_codes').doc(code);
            batch.set(docRef, {
              code: code,
              name: item.name || '',
              role: item.role || 'Judge & Evaluator',
              event: item.event || 'AIVORA 2K26',
              maxQuota: item.maxQuota || 1,
              usedCount: item.usedCount || 0,
              claimedMembers: item.claimedMembers || [],
              updatedAt: new Date().toISOString()
            }, { merge: true });
          });
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase saveJudgeCodes error:', e);
      }
    }
  }

  async function recordJudgeCert(cert) {
    if (!cert || !cert.certId) return false;
    const db = getDb();
    if (db && isLive()) {
      try {
        const docId = sanitizeDocId(cert.certId);
        await db.collection('judge_certs').doc(docId).set({
          id: docId,
          name: cert.name,
          code: (cert.code || '').toUpperCase(),
          role: cert.role || 'Judge & Evaluator',
          certId: cert.certId,
          date: cert.date || new Date().toLocaleDateString('en-GB'),
          claimedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase recordJudgeCert error:', e);
      }
    }

    try {
      const certs = JSON.parse(localStorage.getItem('admin_judge_certs') || '[]');
      certs.push(cert);
      localStorage.setItem('admin_judge_certs', JSON.stringify(certs));
    } catch (e) {}
    return true;
  }

  async function getAllJudgeCerts() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('judge_certs').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => {
            const d = doc.data();
            list.push({
              id: doc.id,
              name: d.name,
              code: d.code,
              role: d.role,
              certId: d.certId || d.cert_id,
              date: d.date,
              claimedAt: d.claimedAt || d.claimed_at
            });
          });
          return list;
        }
      } catch (e) {
        console.warn('Firebase getAllJudgeCerts error:', e);
      }
    }
    try {
      return JSON.parse(localStorage.getItem('admin_judge_certs') || '[]');
    } catch (e) {
      return [];
    }
  }

  async function clearJudgeClaims() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('judge_certs').get();
        if (!snap.empty) {
          const batch = db.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firebase clearJudgeClaims error:', e);
      }
    }
  }

  // ── CUSTOM TEMPLATES (CLOUDINARY URLS SAVED IN FIRESTORE) ──

  async function getCustomTemplates() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const snap = await db.collection('custom_templates').get();
        if (!snap.empty) {
          const result = {};
          snap.forEach(doc => {
            const r = doc.data();
            if (doc.id && r.url) result[doc.id] = r.url;
            else if (r.key && r.url) result[r.key] = r.url;
          });
          return result;
        }
      } catch (e) {
        console.warn('Firebase getCustomTemplates error:', e);
      }
    }
    return {};
  }

  async function saveCustomTemplate(key, url) {
    if (!key || !url) return;
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('custom_templates').doc(key).set({
          key,
          url,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase saveCustomTemplate error:', e);
      }
    }
  }

  async function deleteCustomTemplate(key) {
    if (!key) return;
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('custom_templates').doc(key).delete();
      } catch (e) {
        console.warn('Firebase deleteCustomTemplate error:', e);
      }
    }
  }

  // ── TEMPLATE POSITIONS & ADMIN CONFIG ──

  async function getTemplatePositions() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const doc = await db.collection('admin_config').doc('positions').get();
        if (doc.exists) {
          const d = doc.data();
          if (d && d.data) return d.data;
          if (d && d.participation) return d;
        }
      } catch (e) {
        console.warn('Firebase getTemplatePositions error:', e);
      }
    }

    try {
      const local = localStorage.getItem('tpl_positions');
      if (local) return JSON.parse(local);
    } catch (e) {}

    return {
      participation: { nameX: 1754, nameY: 1175 },
      winner1: { nameX: 1754, nameY: 1420 },
      winner2: { nameX: 1754, nameY: 1420 },
      winner3: { nameX: 1754, nameY: 1420 },
      judges: { nameX: 1754, nameY: 1250 }
    };
  }

  async function saveTemplatePositions(positions) {
    if (!positions) return;
    try {
      localStorage.setItem('tpl_positions', JSON.stringify(positions));
    } catch (e) {}

    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('admin_config').doc('positions').set({
          data: positions,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase saveTemplatePositions error:', e);
      }
    }
  }

  // ── SIGNATURES ──
  async function getSignatures() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const doc = await db.collection('admin_config').doc('signatures').get();
        if (doc.exists) {
          const d = doc.data();
          return d.data || d.signatures || {};
        }
      } catch (e) {
        console.warn('Firebase getSignatures error:', e);
      }
    }
    return {};
  }

  async function saveSignatures(signatures) {
    if (!signatures) return;
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('admin_config').doc('signatures').set({
          data: signatures,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase saveSignatures error:', e);
      }
    }
  }

  // ── SITE STATS ──

  async function getSiteStats() {
    const db = getDb();
    if (db && isLive()) {
      try {
        const doc = await db.collection('site_stats').doc('stats').get();
        if (doc.exists) {
          const d = doc.data();
          return {
            participants: d.participants,
            nations: d.nations,
            themes: d.themes,
            mentors: d.mentors
          };
        }
      } catch (e) {
        console.warn('Firebase getSiteStats error:', e);
      }
    }

    try {
      const local = localStorage.getItem('site_stats');
      if (local) return JSON.parse(local);
    } catch (e) {}

    return {
      participants: 2481,
      nations: 150,
      themes: 5,
      mentors: 30
    };
  }

  async function saveSiteStats(stats) {
    if (!stats) return;
    try {
      localStorage.setItem('site_stats', JSON.stringify(stats));
    } catch (e) {}

    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('site_stats').doc('stats').set({
          participants: Number(stats.participants) || 2481,
          nations: Number(stats.nations) || 150,
          themes: Number(stats.themes) || 5,
          mentors: Number(stats.mentors) || 30,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase saveSiteStats error:', e);
      }
    }
  }

  // ── CONTACT MESSAGES ──
  async function saveContactMessage(msg) {
    if (!msg) return;
    const db = getDb();
    if (db && isLive()) {
      try {
        await db.collection('contact_messages').add({
          ...msg,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Firebase saveContactMessage error:', e);
      }
    }
  }

  // ── TEST CONNECTIONS ──

  async function testFirebaseConnection() {
    const db = getDb();
    if (!db) {
      return { success: false, message: 'Firebase SDK not initialized. Verify your configuration.' };
    }
    try {
      await db.collection('site_stats').doc('stats').get();
      return { success: true, message: 'Firebase Firestore connected successfully!' };
    } catch (err) {
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
        return {
          success: false,
          isPermission: true,
          message: 'Permission denied: Please ensure your Firestore Security Rules allow read/write in Firebase Console (Test mode: allow read, write: if true;).'
        };
      }
      return { success: false, message: err.message || 'Firebase connection test failed.' };
    }
  }

  async function testCloudinaryConnection() {
    const cfg = getCloudinaryConfig();
    try {
      // Test upload of 1x1 transparent png
      const testPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const url = await uploadToCloudinary(testPixel, cfg.folder || 'devloper');
      if (url && url.startsWith('http')) {
        return { success: true, message: `Cloudinary connected successfully! (Cloud: ${cfg.cloudName}, Preset: ${cfg.uploadPreset})`, url };
      }
      return { success: false, message: 'Upload succeeded but no valid image URL was returned.' };
    } catch (err) {
      return { success: false, message: err.message || 'Cloudinary connection test failed.' };
    }
  }

  async function testConnection() {
    const fbRes = await testFirebaseConnection();
    const clRes = await testCloudinaryConnection();

    if (fbRes.success && clRes.success) {
      return {
        success: true,
        message: 'Both Firebase Firestore and Cloudinary are fully connected and ready!'
      };
    }

    const messages = [];
    if (!fbRes.success) messages.push(`Firebase: ${fbRes.message}`);
    else messages.push(`Firebase: Connected`);

    if (!clRes.success) messages.push(`Cloudinary: ${clRes.message}`);
    else messages.push(`Cloudinary: Connected`);

    return {
      success: fbRes.success && clRes.success,
      message: messages.join(' | ')
    };
  }

  // ── UNIFIED BACKEND API EXPORT ──
  const AivoraBackend = {
    // Config
    getConfig: getConfig,
    saveConfig: saveConfig,
    getFirebaseConfig: getFirebaseConfig,
    saveFirebaseConfig: saveFirebaseConfig,
    getCloudinaryConfig: getCloudinaryConfig,
    saveCloudinaryConfig: saveCloudinaryConfig,
    getClient: getDb,
    getDb: getDb,
    isLive: isLive,
    testConnection: testConnection,
    testFirebaseConnection: testFirebaseConnection,
    testCloudinaryConnection: testCloudinaryConnection,

    // Participants (Firebase Firestore)
    getParticipant: getParticipant,
    upsertParticipant: upsertParticipant,
    getAllParticipants: getAllParticipants,
    bulkUpsertParticipants: bulkUpsertParticipants,
    deleteParticipant: deleteParticipant,
    clearAllParticipants: clearAllParticipants,

    // Winners (Firebase Firestore)
    getWinnerCodes: getWinnerCodes,
    saveWinnerCodes: saveWinnerCodes,
    recordWinnerClaim: recordWinnerClaim,
    getAllWinnerClaims: getAllWinnerClaims,
    deleteWinnerClaim: deleteWinnerClaim,
    clearWinnerClaims: clearWinnerClaims,

    // Judges (Firebase Firestore)
    getJudgeCodes: getJudgeCodes,
    saveJudgeCodes: saveJudgeCodes,
    recordJudgeCert: recordJudgeCert,
    getAllJudgeCerts: getAllJudgeCerts,
    clearJudgeClaims: clearJudgeClaims,

    // Cloudinary Storage & Custom Templates
    uploadToCloudinary: uploadToCloudinary,
    uploadStorageFile: uploadStorageFile,
    deleteStorageFile: deleteStorageFile,
    getCustomTemplates: getCustomTemplates,
    saveCustomTemplate: saveCustomTemplate,
    deleteCustomTemplate: deleteCustomTemplate,
    getSignatures: getSignatures,
    saveSignatures: saveSignatures,

    // Positions, Stats & Messages (Firebase Firestore)
    getTemplatePositions: getTemplatePositions,
    saveTemplatePositions: saveTemplatePositions,
    getSiteStats: getSiteStats,
    saveSiteStats: saveSiteStats,
    saveContactMessage: saveContactMessage
  };

  // Export to global window scope under modern & backward-compatible names
  window.AivoraBackend = AivoraBackend;
  window.AivoraFirebase = AivoraBackend;
  window.AivoraCloudinary = {
    upload: uploadToCloudinary,
    getConfig: getCloudinaryConfig,
    saveConfig: saveCloudinaryConfig,
    testConnection: testCloudinaryConnection
  };
  // Backward compatibility alias for any existing scripts
  window.AivoraSupabase = AivoraBackend;

})(window);
