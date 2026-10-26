/**
 * main.js — Innovation Hacks Website Controller
 * Handles Navigation, Mobile Drawer, Certificate Gallery Modal,
 * Interactive Certificate Verification Engine, FAQ Accordion,
 * Project Filters, and Contact Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── DYNAMIC COPYRIGHT YEAR ──
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── NAVBAR SCROLL SHADOW & ACTIVE LINK OBSERVER ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (navbar) {
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    let currentSection = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── MOBILE DRAWER NAVIGATION ──
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (mobileDrawer && mobileDrawerOverlay) {
      mobileDrawer.classList.add('open');
      mobileDrawerOverlay.classList.add('open');
      hamburgerBtn.classList.add('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileDrawerOverlay) {
      mobileDrawer.classList.remove('open');
      mobileDrawerOverlay.classList.remove('open');
      if (hamburgerBtn) {
        hamburgerBtn.classList.remove('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => {
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileMenu);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── SPOTLIGHT QUICK SEARCH CONTROLLER ──
  const navSearchBtn = document.getElementById('navSearchBtn');
  const searchModalOverlay = document.getElementById('searchModalOverlay');
  const searchModalClose = document.getElementById('searchModalClose');
  const spotlightSearchInput = document.getElementById('spotlightSearchInput');
  const searchResultsList = document.getElementById('searchResultsList');

  function openSearchModal() {
    if (searchModalOverlay && spotlightSearchInput) {
      searchModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => spotlightSearchInput.focus(), 50);
    }
  }

  function closeSearchModal() {
    if (searchModalOverlay) {
      searchModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      if (spotlightSearchInput) spotlightSearchInput.value = '';
      filterSearchResults('');
    }
  }

  // ── ADMIN PANEL SHORTCUT & TRIGGER CONTROLLER (\admin, /admin) ──
  let _adminKeyBuf = '';

  function openAdminPanel() {
    window.location.href = 'control.html';
  }

  // URL Hash & Search Query Auto-Detection
  function checkAdminUrlTriggers() {
    try {
      const full = (window.location.href || '').toLowerCase();
      const hash = decodeURIComponent(window.location.hash || '').toLowerCase();
      const search = decodeURIComponent(window.location.search || '').toLowerCase();
      const path = decodeURIComponent(window.location.pathname || '').toLowerCase();

      if (
        full.includes('\\admin') ||
        hash.includes('\\admin') || hash.includes('/admin') ||
        hash === '#admin' || hash === '#control' ||
        search.includes('admin') || search.includes('control') ||
        path.endsWith('/admin')
      ) {
        openAdminPanel();
      }
    } catch (err) {
      console.warn('Admin route check warning:', err);
    }
  }

  checkAdminUrlTriggers();
  window.addEventListener('hashchange', checkAdminUrlTriggers);

  function filterSearchResults(query) {
    if (!searchResultsList) return;
    const items = searchResultsList.querySelectorAll('.search-result-item');
    const q = query.trim().toLowerCase();
    const isSpecialAdminSearch = (
      q === '\\admin' || q === '/admin' || q === 'admin'
    );

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const isAdminItem = item.id === 'searchItemAdmin';

      if (isSpecialAdminSearch) {
        item.style.display = isAdminItem ? 'flex' : 'none';
      } else if (!q) {
        item.style.display = 'flex';
      } else if (text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (navSearchBtn) navSearchBtn.addEventListener('click', openSearchModal);
  if (searchModalClose) searchModalClose.addEventListener('click', closeSearchModal);
  if (searchModalOverlay) {
    searchModalOverlay.addEventListener('click', (e) => {
      if (e.target === searchModalOverlay) closeSearchModal();
    });
  }

  if (spotlightSearchInput) {
    spotlightSearchInput.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim().toLowerCase();
      if (val === '\\admin' || val === '/admin') {
        openAdminPanel();
        return;
      }
      filterSearchResults(e.target.value);
    });

    spotlightSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = (spotlightSearchInput.value || '').trim().toLowerCase();
        if (
          val === '\\admin' || val === '/admin' || val === 'admin'
        ) {
          e.preventDefault();
          openAdminPanel();
          return;
        }
      }
    });
  }

  // Keyboard shortcut Ctrl+K / Cmd+K to open search, Escape to close, plus global \admin sequence listener
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
      return;
    } else if (e.key === 'Escape' && searchModalOverlay && searchModalOverlay.classList.contains('open')) {
      closeSearchModal();
      return;
    }

    // Check if Enter pressed in any input/textarea
    const target = e.target;
    const tag = (target && target.tagName ? target.tagName : '').toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

    if (isInput && e.key === 'Enter') {
      const v = (target.value || '').trim().toLowerCase();
      if (
        v === '\\admin' || v === '/admin' || v === 'admin'
      ) {
        e.preventDefault();
        openAdminPanel();
        return;
      }
    }

    // Capture single printable character in rolling buffer (works everywhere, even when typing anywhere on the page!)
    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      _adminKeyBuf = (_adminKeyBuf + e.key.toLowerCase()).slice(-20);
      if (
        _adminKeyBuf.endsWith('\\admin') ||
        _adminKeyBuf.endsWith('/admin')
      ) {
        openAdminPanel();
      }
    }
  });

  // Listen to input events anywhere on the page (e.g. typing or pasting \admin into any field)
  document.addEventListener('input', (e) => {
    const v = (e.target && e.target.value ? e.target.value : '').trim().toLowerCase();
    if (v === '\\admin' || v === '/admin') {
      openAdminPanel();
    }
  });

  if (searchResultsList) {
    searchResultsList.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', closeSearchModal);
    });
  }

  // ── CERTIFICATE GALLERY MODAL CONTROLLER ──
  const certModal = document.getElementById('certGalleryModal');
  const certModalClose = document.getElementById('certModalClose');
  const certModalImage = document.getElementById('certModalImage');
  const certModalCanvas = document.getElementById('certModalCanvas');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalCategory = document.getElementById('certModalCategory');
  const certModalDownloadBtn = document.getElementById('certModalDownloadBtn');
  const certModalPdfBtn = document.getElementById('certModalPdfBtn');

  // Certificate Master Database for Modal & Gallery
  const CERTIFICATE_DATA = {
    participation: {
      title: 'Certificate of Participation — Global AI Hackathon 2026',
      category: 'Participant Credential',
      image: 'assets/certificates/cert-participation.png',
      webp: 'assets/certificates/optimized/cert-participation.webp',
      alt: 'Official Certificate of Participation Global AI Hackathon 2026'
    },
    winner1: {
      title: 'Certificate of Achievement — First Prize Winner',
      category: '1st Prize Distinction',
      image: 'assets/certificates/cert-first-prize.png',
      webp: 'assets/certificates/optimized/cert-first-prize.webp',
      alt: 'Official 1st Prize Winner Certificate of Excellence'
    },
    winner2: {
      title: 'Certificate of Achievement — Second Prize Winner',
      category: '2nd Prize Distinction',
      image: 'assets/certificates/cert-second-prize.png',
      webp: 'assets/certificates/optimized/cert-second-prize.webp',
      alt: 'Official 2nd Prize Winner Certificate of Excellence'
    },
    winner3: {
      title: 'Certificate of Achievement — Third Prize Winner',
      category: '3rd Prize Distinction',
      image: 'assets/certificates/cert-third-prize.png',
      webp: 'assets/certificates/optimized/cert-third-prize.webp',
      alt: 'Official 3rd Prize Winner Certificate of Excellence'
    },
    judge: {
      title: 'Certificate of Appreciation — Judge',
      category: 'Jury & Evaluator Credential',
      image: 'assets/certificates/cert-judge-appreciation.jpg',
      webp: 'assets/certificates/optimized/cert-judge-appreciation.webp',
      alt: 'Official Judge Certificate of Appreciation'
    }
  };

  let activeModalCertKey = 'participation';

  window.openCertModal = function (certKey) {
    const data = CERTIFICATE_DATA[certKey] || CERTIFICATE_DATA.participation;
    activeModalCertKey = certKey;

    if (certModalTitle) certModalTitle.textContent = data.title;
    if (certModalCategory) certModalCategory.textContent = data.category;

    if (certModalImage) {
      certModalImage.style.display = 'block';
      certModalImage.src = data.image;
      certModalImage.alt = data.alt;
    }
    if (certModalCanvas) {
      certModalCanvas.style.display = 'none';
    }

    if (certModalDownloadBtn) {
      certModalDownloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = data.image;
        link.download = `Innovation-Hacks-${certKey}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    if (certModalPdfBtn) {
      certModalPdfBtn.onclick = () => {
        downloadCertificateAsPDF(data.image, `Innovation-Hacks-${certKey}.pdf`);
      };
    }

    if (certModal) {
      certModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  function closeCertGalleryModal() {
    if (certModal) {
      certModal.classList.remove('active');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  }

  if (certModalClose) certModalClose.addEventListener('click', closeCertGalleryModal);

  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {
        closeCertGalleryModal();
      }
    });
  }

  // Escape key listener for both modal and drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (certModal && certModal.classList.contains('active')) {
        closeCertGalleryModal();
      }
      closeMobileMenu();
    }
  });

  // Helper for PDF Download via jsPDF if loaded
  function downloadCertificateAsPDF(imageSrc, filename) {
    if (window.jspdf && window.jspdf.jsPDF) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        const doc = new window.jspdf.jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [img.width / 4, img.height / 4]
        });
        doc.addImage(img, 'PNG', 0, 0, img.width / 4, img.height / 4);
        doc.save(filename);
      };
      img.src = imageSrc;
    } else {
      // Fallback to downloading image directly
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = filename.replace('.pdf', '.png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // ── INTERACTIVE PARTICIPANT VERIFICATION ENGINE ──
  // Powered by Firebase Firestore Database & Resilient Local Storage
  const AivoraSB = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;

  // Helper: Escape HTML for security
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function verifyRosterEmail(rawEmail, rawName) {
    if (!rawEmail) return { registered: false, reason: 'empty' };
    const email = rawEmail.trim().toLowerCase();
    const nameToMatch = (rawName || '').trim().toLowerCase();

    // 1. Check local storage (fed by Admin Panel)
    try {
      const localRoster = localStorage.getItem('registered_participants');
      if (localRoster) {
        const list = JSON.parse(localRoster);
        if (Array.isArray(list) && list.length > 0) {
          const found = list.find((item) => {
            if (!item) return false;
            const itemEmail = (typeof item === 'string' ? item : (item.email || '')).trim().toLowerCase();
            return itemEmail === email; // STRICT: ONLY fed email IDs in Admin Panel are allowed!
          });
          if (found) {
            const foundName = typeof found === 'object' && found.name ? found.name : '';
            return { registered: true, name: foundName, email };
          }
        }
      }
    } catch (e) {}

    // 1B. Check IndexedDB registered_participants (supports massive 10,000+ member rosters)
    try {
      const idbParts = await new Promise((resolve) => {
        const req = indexedDB.open('NextGenTemplatesDB', 1);
        req.onsuccess = () => {
          try {
            const db = req.result;
            if (db.objectStoreNames.contains('templates')) {
              const tx = db.transaction('templates', 'readonly');
              const g = tx.objectStore('templates').get('registered_participants');
              g.onsuccess = () => resolve(g.result);
              g.onerror = () => resolve(null);
            } else {
              resolve(null);
            }
          } catch(e) { resolve(null); }
        };
        req.onerror = () => resolve(null);
      });
      if (idbParts && Array.isArray(idbParts) && idbParts.length > 0) {
        const found = idbParts.find((item) => {
          if (!item) return false;
          const itemEmail = (typeof item === 'string' ? item : (item.email || '')).trim().toLowerCase();
          return itemEmail === email;
        });
        if (found) {
          const foundName = typeof found === 'object' && found.name ? found.name : '';
          return { registered: true, name: foundName, email };
        }
      }
    } catch(e) {}

    // 2. Check Firebase participants collection
    const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
    if (backend) {
      try {
        const participant = await backend.getParticipant(email);
        if (participant) {
          return {
            registered: true,
            name: participant.name || '',
            email: participant.email,
            claimed: Boolean(participant.claimed),
            certId: participant.certId
          };
        }
      } catch (e) {
        console.warn('Firebase getParticipant check notice:', e);
      }
    }

    // STRICT: Not found in Admin Panel roster
    return { registered: false, reason: 'not_found', email };
  }

  window.handleParticipantVerification = async function () {
    const emailInput = document.getElementById('portalCertEmail');
    const nameInput = document.getElementById('portalCertName');
    const alertBox = document.getElementById('portalCertAlert');
    const btn = document.getElementById('portalCertSubmitBtn');

    if (!emailInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const enteredName = nameInput ? nameInput.value.trim() : '';

    if (alertBox) alertBox.style.display = 'none';
    emailInput.classList.remove('is-invalid', 'is-valid');

    if (!email || !email.includes('@') || !email.includes('.')) {
      emailInput.classList.add('is-invalid');
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.className = 'cert-alert-box cert-alert-danger';
        alertBox.innerHTML = `
          <div class="cert-alert-icon">⚠️</div>
          <div>
            <strong>Valid Email Required</strong>
            <p>Please enter the registered email address used for AIVORA 2K26 / Innovation Hacks events.</p>
          </div>
        `;
      }
      emailInput.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-icon-bolt">⏳</span> <span>Verifying &amp; Generating...</span>';
    }

    try {
      const check = await verifyRosterEmail(email, enteredName);

      if (!check.registered) {
        emailInput.classList.add('is-invalid');
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'cert-alert-box cert-alert-danger';
          alertBox.innerHTML = `
            <div class="cert-alert-icon">🔒</div>
            <div>
              <strong>Not Registered</strong>
              <p>The email <strong>${email}</strong> was not found in our verified participant roster. Certificates can only be generated for registered participants.</p>
            </div>
          `;
        }

        // Show "Not Registered" Pop-up Modal as requested
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Not Registered',
            html: `
              <div style="text-align:center;padding:4px 0;">
                <p style="font-size:15px;color:#1e293b;margin-bottom:12px;line-height:1.5;">
                  The email <strong style="color:#0B2D5C;">${email}</strong> was not found in our verified participant roster.
                </p>
                <div style="background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;padding:12px 14px;font-size:13px;color:#64748b;line-height:1.5;text-align:left;">
                  🔒 <strong>Verification Notice:</strong><br>
                  Certificates can only be generated for email IDs registered in the Admin Panel. If you participated, please contact the organizers to add your email.
                </div>
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'OK, Understood',
            confirmButtonColor: '#155EEF',
            background: '#FFFFFF'
          });
        } else {
          alert(`Not Registered: The email "${email}" was not found in the verified participant roster.`);
        }

        emailInput.focus();
        return;
      }

      emailInput.classList.add('is-valid');

      // Use entered name if provided, else use official verified name from admin roster
      const certName = enteredName ? enteredName : (check.name || email.split('@')[0].toUpperCase());
      if (nameInput && !enteredName) {
        nameInput.value = certName;
      }

      const certId = (check && check.certId) || ('IH-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      const nowStr = new Date().toLocaleString();

      // Record claim so Admin Panel shows real-time claim status
      try {
        const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
        if (backend) {
          await backend.upsertParticipant({
            name: certName,
            email: email,
            claimed: true,
            claimedAt: new Date().toISOString(),
            certId: certId
          });
        }
        const localList = JSON.parse(localStorage.getItem('registered_participants') || '[]');
        const idx = localList.findIndex(x => x && ((typeof x === 'string' ? x : x.email) || '').toLowerCase() === email);
        if (idx !== -1) {
          if (typeof localList[idx] === 'string') {
            localList[idx] = { email: email, name: certName, claimed: true, certId: certId };
          } else {
            localList[idx].name = certName;
            localList[idx].claimed = true;
            localList[idx].certId = certId;
          }
          localStorage.setItem('registered_participants', JSON.stringify(localList));
        }
      } catch (e) {}

      // Render on Canvas via CertEngine (Admin Uploaded Template)
      if (certModalCanvas && window.CertEngine && typeof window.CertEngine.renderFull === 'function') {
        const canvas = certModalCanvas;
        certModalCanvas.style.display = 'block';
        if (certModalImage) certModalImage.style.display = 'none';

        const renderRes = await window.CertEngine.renderFull(canvas, '', certName, 'participation');
        if (renderRes && renderRes.error) {
          throw new Error(renderRes.message || 'Render failed');
        }

        if (certModalTitle) certModalTitle.textContent = `Verified Certificate — ${certName}`;
        if (certModalCategory) certModalCategory.textContent = `Participant ID: ${email} • Credential: ${certId}`;

        if (certModalDownloadBtn) {
          certModalDownloadBtn.onclick = () => {
            window.CertEngine.downloadPNG(canvas, `Innovation-Hacks-Certificate-${certName.replace(/\s+/g, '_')}.png`);
          };
        }
        if (certModalPdfBtn) {
          certModalPdfBtn.onclick = () => {
            window.CertEngine.downloadPDF(canvas, `Innovation-Hacks-Certificate-${certName.replace(/\s+/g, '_')}.pdf`);
          };
        }

        // Open modal
        if (certModal) {
          certModal.classList.add('active');
          document.body.classList.add('modal-open');
          document.body.style.overflow = 'hidden';
        }
      }

      // Display high-visibility success card with direct View & Download actions
      if (alertBox) {
        alertBox.style.display = 'flex';
        alertBox.className = 'cert-alert-container cert-alert-box cert-alert-success';
        alertBox.innerHTML = `
          <div class="cert-alert-icon" style="font-size:24px;color:#16A34A;line-height:1;">✓</div>
          <div style="flex:1;">
            <strong style="font-size:16px;color:#15803D;display:block;margin-bottom:4px;font-family:'Poppins',sans-serif;">Registration Verified! Certificate Generated</strong>
            <p style="margin:0 0 12px 0;font-size:13.5px;color:#334155;line-height:1.55;">
              Welcome, <strong>${certName}</strong> (ID: <code style="background:#DCFCE7;color:#166534;padding:2px 6px;border-radius:4px;font-family:'Space Mono',monospace;font-weight:700;">${certId}</code>). Your official Certificate of Participation is ready!
            </p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <button type="button" class="btn-portal-action" onclick="if(document.getElementById('certGalleryModal')){document.getElementById('certGalleryModal').classList.add('active');document.body.classList.add('modal-open');document.body.style.overflow='hidden';}" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#1684D8,#0B2D5C);color:#fff;font-weight:700;font-size:13px;padding:9px 18px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(22,132,216,0.3);">
                <span>👁️ View Certificate</span>
              </button>
              <button type="button" class="btn-portal-action" onclick="window.CertEngine && window.CertEngine.downloadPNG(document.getElementById('certModalCanvas'), 'Innovation-Hacks-Certificate-${encodeURIComponent(certName)}.png');" style="display:inline-flex;align-items:center;gap:6px;background:#0B1F3A;color:#fff;font-weight:700;font-size:13px;padding:9px 18px;border-radius:10px;border:none;cursor:pointer;">
                <span>📥 Download PNG</span>
              </button>
              <button type="button" class="btn-portal-action" onclick="window.CertEngine && window.CertEngine.downloadPDF(document.getElementById('certModalCanvas'), 'Innovation-Hacks-Certificate-${encodeURIComponent(certName)}.pdf');" style="display:inline-flex;align-items:center;gap:6px;background:#FFFFFF;color:#0B2D5C;font-weight:700;font-size:13px;padding:9px 18px;border-radius:10px;border:1.5px solid #0B2D5C;cursor:pointer;">
                <span>📄 Download PDF</span>
              </button>
            </div>
          </div>
        `;
      }

    } catch (err) {
      console.error('Participant verification error:', err);
      if (alertBox) {
        alertBox.style.display = 'flex';
        alertBox.className = 'cert-alert-container cert-alert-box cert-alert-danger';
        alertBox.innerHTML = `
          <div class="cert-alert-icon">⚠️</div>
          <div>
            <strong>Generation Notice</strong>
            <p>Could not render certificate: ${err.message || 'Please check your connection and retry'}.</p>
          </div>
        `;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon-bolt">⚡</span> <span>Generate Certificate</span>';
      }
    }
  };

  // ── MULTI-PORTAL TAB SWITCHER (PARTICIPANT / WINNER / JUDGE) ──
  window.switchPortalTab = function (tabName) {
    const pill = document.getElementById('portalCardPillBadge');
    const heading = document.getElementById('portalCardHeading');

    const panelParticipant = document.getElementById('tabPanelParticipant');
    const panelWinner = document.getElementById('tabPanelWinner');
    const panelJudge = document.getElementById('tabPanelJudge');

    const btnParticipant = document.getElementById('btnPortalParticipant');
    const btnWinner = document.getElementById('btnPortalWinner');
    const btnJudge = document.getElementById('btnPortalJudge');

    // Deactivate all panels and buttons
    [panelParticipant, panelWinner, panelJudge].forEach(p => p && p.classList.remove('active'));
    [btnParticipant, btnWinner, btnJudge].forEach(b => b && b.classList.remove('active'));

    if (tabName === 'winner') {
      if (panelWinner) panelWinner.classList.add('active');
      if (btnWinner) btnWinner.classList.add('active');
      if (pill) pill.textContent = 'GLOBAL WINNER DISTINCTION';
      if (heading) heading.textContent = 'Winner & Distinction Certificate Portal';
    } else if (tabName === 'judge') {
      if (panelJudge) panelJudge.classList.add('active');
      if (btnJudge) btnJudge.classList.add('active');
      if (pill) pill.textContent = 'JURY & EVALUATOR CREDENTIAL';
      if (heading) heading.textContent = 'Judge Appreciation Certificate Portal';
    } else {
      // Default: participant
      if (panelParticipant) panelParticipant.classList.add('active');
      if (btnParticipant) btnParticipant.classList.add('active');
      if (pill) pill.textContent = 'PARTICIPANT CREDENTIAL';
      if (heading) heading.textContent = 'Participant Certificate Portal';
    }
  };

  // ── WINNER VERIFICATION & GENERATION ──
  window.handleWinnerVerification = async function () {
    const nameInput = document.getElementById('portalWinnerName');
    const tierSelect = document.getElementById('portalWinnerTier');
    const emailInput = document.getElementById('portalWinnerEmail');
    const alertBox = document.getElementById('portalWinnerAlert');
    const btn = document.getElementById('portalWinnerSubmitBtn');

    if (!nameInput) return;
    const name = nameInput.value.trim();
    let tier = (tierSelect && tierSelect.value) ? tierSelect.value : 'winner1';
    const emailOrCode = emailInput ? emailInput.value.trim().toUpperCase() : '';

    if (!name) {
      nameInput.classList.add('is-invalid');
      nameInput.focus();
      return;
    }
    nameInput.classList.remove('is-invalid');

    if (!emailOrCode) {
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        emailInput.focus();
      }
      return;
    }
    if (emailInput) emailInput.classList.remove('is-invalid');
    if (alertBox) alertBox.style.display = 'none';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-icon-bolt">⏳</span> <span>Authenticating &amp; Rendering...</span>';
    }

    try {
      // Validate against Admin Winner Codes & Roster
      let wCodes = {};
      try {
        const local = localStorage.getItem('winnerCodes');
        if (local) wCodes = JSON.parse(local);
      } catch(e) {}

      const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
      if (backend) {
        try {
          const sCodes = await backend.getWinnerCodes();
          if (sCodes && Object.keys(sCodes).length > 0) {
            wCodes = Object.assign({}, sCodes, wCodes);
          }
        } catch(e) {}
      }

      const hasWinnerCodes = Object.keys(wCodes).length > 0;
      let isVerifiedWinner = false;
      let matchedCodeKey = '';

      if (hasWinnerCodes) {
        matchedCodeKey = Object.keys(wCodes).find(k => k.trim().toUpperCase() === emailOrCode);
        if (matchedCodeKey) {
          isVerifiedWinner = true;
        } else {
          // Check if name is in claimedMembers
          isVerifiedWinner = Object.values(wCodes).some(item => {
            if (!item || !Array.isArray(item.claimedMembers)) return false;
            return item.claimedMembers.some(m => {
              const mName = typeof m === 'string' ? m : (m.name || '');
              const mEmail = typeof m === 'object' && m.email ? m.email.toUpperCase() : '';
              return mName.toLowerCase() === name.toLowerCase() || mEmail === emailOrCode;
            });
          });
        }
      } else {
        // Also check if email is registered in general participants
        const rosterCheck = await verifyRosterEmail(emailOrCode, name);
        isVerifiedWinner = rosterCheck.registered;
      }

      if (!isVerifiedWinner) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'cert-alert-box cert-alert-danger';
          alertBox.innerHTML = `
            <div class="cert-alert-icon">🔒</div>
            <div>
              <strong>Winner Record Not Registered</strong>
              <p>The passkey <strong>${emailOrCode}</strong> was not found in our verified winners database.</p>
            </div>
          `;
        }

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Not Registered',
            html: `
              <div style="text-align:center;padding:4px 0;">
                <p style="font-size:15px;color:#1e293b;margin-bottom:12px;line-height:1.5;">
                  The passkey or record for <strong style="color:#0B2D5C;">${emailOrCode}</strong> was not found in our verified winners roster.
                </p>
                <div style="background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;padding:12px 14px;font-size:13px;color:#64748b;line-height:1.5;text-align:left;">
                  🏆 <strong>Winner Verification Notice:</strong><br>
                  Certificates can only be generated for verified winning teams with valid passkeys. If you are an awarded participant, please verify your credentials.
                </div>
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'OK, Understood',
            confirmButtonColor: '#155EEF',
            background: '#FFFFFF'
          });
        }
        return;
      }

      if (matchedCodeKey && wCodes[matchedCodeKey] && wCodes[matchedCodeKey].rank) {
        tier = 'winner' + wCodes[matchedCodeKey].rank;
        if (tierSelect) tierSelect.value = tier;
      }

      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.className = 'cert-alert-box cert-alert-success';
        const tierName = tier === 'winner1' ? '1st Prize Champion' : (tier === 'winner2' ? '2nd Prize Runner-Up' : '3rd Prize Second Runner-Up');
        alertBox.innerHTML = `
          <div class="cert-alert-icon">🏆</div>
          <div>
            <strong>Distinction Record Authenticated!</strong>
            <p>Conferred upon <strong>${name}</strong> (${tierName}). Generating 300 DPI Certificate...</p>
          </div>
        `;
      }

      if (certModalCanvas && window.CertEngine && typeof window.CertEngine.renderFull === 'function') {
        const canvas = certModalCanvas;
        certModalCanvas.style.display = 'block';
        if (certModalImage) certModalImage.style.display = 'none';

        // Render winner distinction certificate
        await window.CertEngine.renderFull(canvas, '', name, tier);

        if (certModalTitle) certModalTitle.textContent = `Verified Distinction Certificate — ${name}`;
        if (certModalCategory) certModalCategory.textContent = `Award Level: ${tierSelect ? tierSelect.options[tierSelect.selectedIndex].text : 'Winner Distinction'}`;

        if (certModalDownloadBtn) {
          certModalDownloadBtn.onclick = () => {
            window.CertEngine.downloadPNG(canvas, `Innovation-Hacks-Distinction-${name.replace(/\s+/g, '_')}.png`);
          };
        }
        if (certModalPdfBtn) {
          certModalPdfBtn.onclick = () => {
            window.CertEngine.downloadPDF(canvas, `Innovation-Hacks-Distinction-${name.replace(/\s+/g, '_')}.pdf`);
          };
        }

        setTimeout(() => {
          if (certModal) certModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }, 300);
      } else {
        window.openCertModal('firstPrize');
      }
    } catch (err) {
      console.error('Winner verification error:', err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon-bolt">🏆</span> <span>Generate Winner Certificate</span>';
      }
    }
  };

  // ── JUDGE VERIFICATION & GENERATION ──
  window.handleJudgeVerification = async function () {
    const nameInput = document.getElementById('portalJudgeName');
    const roleSelect = document.getElementById('portalJudgeRole');
    const emailInput = document.getElementById('portalJudgeEmail');
    const alertBox = document.getElementById('portalJudgeAlert');
    const btn = document.getElementById('portalJudgeSubmitBtn');

    if (!nameInput) return;
    let name = nameInput.value.trim();
    const role = (roleSelect && roleSelect.value) ? roleSelect.value : 'judge';
    const judgeCode = emailInput ? emailInput.value.trim().toUpperCase() : '';

    if (!name) {
      nameInput.classList.add('is-invalid');
      nameInput.focus();
      return;
    }
    nameInput.classList.remove('is-invalid');

    if (!judgeCode) {
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        emailInput.focus();
      }
      return;
    }
    if (emailInput) emailInput.classList.remove('is-invalid');

    if (alertBox) alertBox.style.display = 'none';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-icon-bolt">⏳</span> <span>Rendering Appreciation...</span>';
    }

    try {
      // Validate against Admin Judge Keys
      let jCodes = {};
      try {
        const local = localStorage.getItem('judgeCodes');
        if (local) jCodes = JSON.parse(local);
      } catch(e) {}
      const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
      if (backend) {
        try {
          const sJCodes = await backend.getJudgeCodes();
          if (sJCodes && Object.keys(sJCodes).length > 0) {
            jCodes = Object.assign({}, sJCodes, jCodes);
          }
        } catch(e) {}
      }

      const hasJudgeKeys = Object.keys(jCodes).length > 0;
      if (hasJudgeKeys) {
        let matchedJudgeName = '';
        const isVerifiedJudge = Object.keys(jCodes).some(jName => {
          const jCode = (jCodes[jName] || '').trim().toUpperCase();
          if ((judgeCode && jCode === judgeCode) || jName.trim().toLowerCase() === name.toLowerCase()) {
            matchedJudgeName = jName;
            return true;
          }
          return false;
        });

        if (!isVerifiedJudge) {
          if (emailInput) emailInput.classList.add('is-invalid');
          if (nameInput) nameInput.classList.add('is-invalid');
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.className = 'cert-alert-box cert-alert-danger';
            alertBox.innerHTML = `
              <div class="cert-alert-icon">🔒</div>
              <div>
                <strong>Judge Code Not Registered</strong>
                <p>The code <strong>${judgeCode || name}</strong> was not found in our verified judges roster.</p>
              </div>
            `;
          }

          if (typeof Swal !== 'undefined') {
            Swal.fire({
              title: 'Not Registered',
              html: `
                <div style="text-align:center;padding:4px 0;">
                  <p style="font-size:15px;color:#1e293b;margin-bottom:12px;line-height:1.5;">
                    The judge code <strong style="color:#0B2D5C;">${judgeCode || name}</strong> was not found in our verified judges roster.
                  </p>
                  <div style="background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;padding:12px 14px;font-size:13px;color:#64748b;line-height:1.5;text-align:left;">
                    🎖️ <strong>Official Evaluator Portal:</strong><br>
                    Certificates can only be generated for verified hackathon judges with a valid judge code.
                  </div>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'OK, Understood',
              confirmButtonColor: '#155EEF',
              background: '#FFFFFF'
            });
          }
          return;
        }

        if (matchedJudgeName && (!name || name.length < 3)) {
          name = matchedJudgeName;
          if (nameInput) nameInput.value = name;
        }
      }

      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.className = 'cert-alert-box cert-alert-success';
        alertBox.innerHTML = `
          <div class="cert-alert-icon">🎓</div>
          <div>
            <strong>Evaluator Credential Verified!</strong>
            <p>Appreciation certificate conferred upon <strong>${name}</strong>. Rendering official credential...</p>
          </div>
        `;
      }

      if (certModalCanvas && window.CertEngine && typeof window.CertEngine.renderFull === 'function') {
        const canvas = certModalCanvas;
        certModalCanvas.style.display = 'block';
        if (certModalImage) certModalImage.style.display = 'none';

        // Render judge certificate of appreciation
        await window.CertEngine.renderFull(canvas, '', name, 'judges');

        if (certModalTitle) certModalTitle.textContent = `Certificate of Appreciation — ${name}`;
        if (certModalCategory) certModalCategory.textContent = `Evaluator: ${roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : 'Honorable Judge'}`;

        if (certModalDownloadBtn) {
          certModalDownloadBtn.onclick = () => {
            window.CertEngine.downloadPNG(canvas, `Innovation-Hacks-Appreciation-${name.replace(/\s+/g, '_')}.png`);
          };
        }
        if (certModalPdfBtn) {
          certModalPdfBtn.onclick = () => {
            window.CertEngine.downloadPDF(canvas, `Innovation-Hacks-Appreciation-${name.replace(/\s+/g, '_')}.pdf`);
          };
        }

        setTimeout(() => {
          if (certModal) certModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }, 300);
      } else {
        window.openCertModal('judge');
      }
    } catch (err) {
      console.error('Judge verification error:', err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon-bolt">🎓</span> <span>Generate Judge Certificate</span>';
      }
    }
  };

  // ── FAQ ACCORDION CONTROLLER ──
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = item.classList.contains('active');
        // Close all other items
        faqItems.forEach((other) => {
          other.classList.remove('active');
          const btn = other.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        // Toggle current item
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // Close open FAQ item when clicking anywhere outside on empty space
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.faq-item')) {
      faqItems.forEach((item) => {
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          const btn = item.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Also close open FAQ item on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      faqItems.forEach((item) => {
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          const btn = item.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // ── PROJECTS FILTER CONTROLLER ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category') || '';
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── CONTACT FORM CLIENT-SIDE VALIDATION ──
  const contactForm = document.getElementById('contactForm');
  const contactSuccessAlert = document.getElementById('contactSuccessAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const subjectInput = document.getElementById('contactSubject');
      const messageInput = document.getElementById('contactMessage');
      const submitBtn = document.getElementById('contactSubmitBtn');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        nameInput.classList.add('is-invalid');
        isValid = false;
      } else {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid');
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid');
        isValid = false;
      } else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
      }

      // Validate Subject
      if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
        subjectInput.classList.add('is-invalid');
        isValid = false;
      } else {
        subjectInput.classList.remove('is-invalid');
        subjectInput.classList.add('is-valid');
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageInput.classList.add('is-invalid');
        isValid = false;
      } else {
        messageInput.classList.remove('is-invalid');
        messageInput.classList.add('is-valid');
      }

      if (!isValid) return;

      // Submit state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Message...</span>';
      }

      try {
        const payload = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim(),
          submittedAt: new Date().toISOString()
        };

        // Save contact message to Firebase and LocalStorage
        const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
        if (backend && typeof backend.saveContactMessage === 'function') {
          try {
            await backend.saveContactMessage(payload);
          } catch(e) {}
        }
        const msgs = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        msgs.push(payload);
        localStorage.setItem('contact_messages', JSON.stringify(msgs));

        // Show success
        if (contactSuccessAlert) {
          contactSuccessAlert.style.display = 'block';
        }
        contactForm.reset();
        [nameInput, emailInput, subjectInput, messageInput].forEach((el) => {
          el.classList.remove('is-valid');
        });

        setTimeout(() => {
          if (contactSuccessAlert) {
            contactSuccessAlert.style.display = 'none';
          }
        }, 8000);

      } catch (err) {
        console.error('Contact submission error:', err);
        alert('There was an issue sending your message. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Message</span> <span>→</span>';
        }
      }
    });

    // Real-time error clearance on typing
    ['contactName', 'contactEmail', 'contactSubject', 'contactMessage'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (el.classList.contains('is-invalid')) {
            el.classList.remove('is-invalid');
          }
        });
      }
    });
  }

  // ── HERO 3D INTERACTIVE TILT & PARALLAX ──
  const heroSection = document.getElementById('home');
  const heroVisual = document.getElementById('heroVisual');

  if (heroSection && heroVisual && window.matchMedia('(min-width: 992px)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x;
      targetY = y;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function renderHeroParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (heroVisual) {
        heroVisual.style.transform = `perspective(1000px) rotateY(${currentX * 10}deg) rotateX(${-currentY * 8}deg) translate3d(${currentX * 14}px, ${currentY * 10}px, 0)`;
      }

      requestAnimationFrame(renderHeroParallax);
    }

    renderHeroParallax();
  }

  // ── ABOUT SECTION 3D INTERACTIVE TILT & PARALLAX ──
  const aboutSection = document.getElementById('about');
  const aboutRobotArtWrap = document.getElementById('aboutRobotArtWrap');

  if (aboutSection && aboutRobotArtWrap && window.matchMedia('(min-width: 992px)').matches) {
    let aboutTargetX = 0, aboutTargetY = 0;
    let aboutCurrentX = 0, aboutCurrentY = 0;

    aboutSection.addEventListener('mousemove', (e) => {
      const rect = aboutSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      aboutTargetX = x;
      aboutTargetY = y;
    });

    aboutSection.addEventListener('mouseleave', () => {
      aboutTargetX = 0;
      aboutTargetY = 0;
    });

    const aboutWaveLeft = document.querySelector('.about-wave-left');
    const aboutWaveRight = document.querySelector('.about-wave-right');

    function renderAboutParallax() {
      aboutCurrentX += (aboutTargetX - aboutCurrentX) * 0.08;
      aboutCurrentY += (aboutTargetY - aboutCurrentY) * 0.08;

      if (aboutRobotArtWrap) {
        aboutRobotArtWrap.style.transform = `perspective(1000px) rotateY(${aboutCurrentX * 10}deg) rotateX(${-aboutCurrentY * 8}deg) translate3d(${aboutCurrentX * 14}px, ${aboutCurrentY * 10}px, 0)`;
      }
      if (aboutWaveLeft) {
        aboutWaveLeft.style.transform = `translate3d(${aboutCurrentX * -10}px, ${aboutCurrentY * -5}px, 0)`;
      }
      if (aboutWaveRight) {
        aboutWaveRight.style.transform = `translate3d(${aboutCurrentX * 10}px, ${aboutCurrentY * -5}px, 0)`;
      }

      requestAnimationFrame(renderAboutParallax);
    }

    renderAboutParallax();
  }

  // ── PRIZES 3D PODIUM STAGE MOUSE PARALLAX ──
  const prizesSection = document.getElementById('prizes');
  const prizesStageWrapper = document.querySelector('.prizes-stage-wrapper');

  if (prizesSection && prizesStageWrapper && window.matchMedia('(min-width: 992px)').matches) {
    let prizeTargetX = 0, prizeTargetY = 0;
    let prizeCurrentX = 0, prizeCurrentY = 0;

    prizesSection.addEventListener('mousemove', (e) => {
      const rect = prizesSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      prizeTargetX = x;
      prizeTargetY = y;
    });

    prizesSection.addEventListener('mouseleave', () => {
      prizeTargetX = 0;
      prizeTargetY = 0;
    });

    function renderPrizeParallax() {
      if (window.innerWidth < 992) {
        if (prizesStageWrapper) prizesStageWrapper.style.transform = 'none';
        requestAnimationFrame(renderPrizeParallax);
        return;
      }

      prizeCurrentX += (prizeTargetX - prizeCurrentX) * 0.08;
      prizeCurrentY += (prizeTargetY - prizeCurrentY) * 0.08;

      if (prizesStageWrapper) {
        prizesStageWrapper.style.transform = `perspective(1200px) rotateY(${prizeCurrentX * 6}deg) rotateX(${-prizeCurrentY * 5}deg) translate3d(${prizeCurrentX * 8}px, ${prizeCurrentY * 6}px, 0)`;
      }

      requestAnimationFrame(renderPrizeParallax);
    }

    renderPrizeParallax();
  }

  // ── NEURAL NETWORK CANVAS ANIMATION (AIVORA 2K26 AI THEME) ──
  function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight || 600;

    let mouse = { x: -1000, y: -1000, radius: 140 };

    window.addEventListener('resize', () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || 600;
      initNodes();
    });

    const heroEl = document.getElementById('home');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      heroEl.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }

    let nodes = [];
    const colors = ['#00D9FF', '#8B5CF6', '#3B82F6'];

    function initNodes() {
      nodes = [];
      const count = Math.min(65, Math.floor((width * height) / 12000));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    initNodes();

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Mouse synaptic pull & line
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouse.radius) {
          const mAlpha = (1 - mDist / mouse.radius) * 0.45;
          ctx.strokeStyle = `rgba(139, 92, 246, ${mAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Draw and update nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    }
    animate();
  }
  initNeuralCanvas();

  // ── DYNAMIC HOMEPAGE STATS SYNC FROM FIREBASE ──
  async function syncLiveHomepageStats() {
    const backend = window.AivoraBackend || window.AivoraFirebase || window.AivoraSupabase;
    if (backend) {
      try {
        const stats = await backend.getSiteStats();
        if (stats) {
          const pEl = document.getElementById('statParticipantsNumber');
          if (pEl && stats.participants) {
            pEl.textContent = Number(stats.participants).toLocaleString('en-US') + '+';
          }
          const nEl = document.getElementById('statNationsNumber');
          if (nEl && stats.nations) {
            nEl.textContent = stats.nations + '+';
          }
          const tEl = document.getElementById('statThemesNumber');
          if (tEl && stats.themes) {
            tEl.textContent = stats.themes;
          }
          const mEl = document.getElementById('statMentorsNumber');
          if (mEl && stats.mentors) {
            mEl.textContent = stats.mentors + '+';
          }
        }
      } catch (e) {
        console.warn('Site stats load notice:', e);
      }
    }
  }
  syncLiveHomepageStats();

  // Auto-activate tab from URL parameter or hash (e.g. ?tab=judge or #judge)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'judge' || window.location.hash === '#judge' || window.location.hash === '#tabPanelJudge') {
      if (typeof window.switchPortalTab === 'function') window.switchPortalTab('judge');
    } else if (tabParam === 'winner' || window.location.hash === '#winner' || window.location.hash === '#tabPanelWinner') {
      if (typeof window.switchPortalTab === 'function') window.switchPortalTab('winner');
    }
  } catch (e) {}
});
