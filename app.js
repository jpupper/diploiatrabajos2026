// Core application logic for the gallery
document.addEventListener("DOMContentLoaded", () => {
  // -------- Elements --------
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryGridTp2 = document.getElementById("gallery-grid-tp2");
  const galleryGridTp3 = document.getElementById("gallery-grid-tp3");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("sketch-modal");
  const modalIframe = document.getElementById("modal-iframe");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");
  const modalExternalLink = document.getElementById("modal-external-link");
  const loadingIndicator = document.getElementById("modal-loading");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const sections = {
    tp1: document.getElementById("section-tp1"),
    tp2: document.getElementById("section-tp2"),
    tp3: document.getElementById("section-tp3")
  };
  let activeTab = "tp1";

  // -------- p5.js helpers --------
  function getEmbedUrl(url) {
    return url.replace(/\/sketches\/|\/full\//, "/embed/");
  }

  // -------- Tab switching --------
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (tab === activeTab) return;

      // Update button states
      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      // Update section visibility
      Object.keys(sections).forEach(key => {
        sections[key].classList.toggle("active", key === tab);
      });

      activeTab = tab;

      // Show/hide search bar
      if (searchInput) {
        const searchWrapper = searchInput.closest(".search-wrapper");
        if (searchWrapper) {
          searchWrapper.style.display = tab === "tp1" ? "" : "none";
        }
        searchInput.value = "";
      }

      // Render the tab if not yet rendered
      if (tab === "tp2" && galleryGridTp2 && !galleryGridTp2.hasChildNodes()) {
        renderTP2Gallery(TP2_DATA);
      } else if (tab === "tp3" && galleryGridTp3 && !galleryGridTp3.hasChildNodes()) {
        renderTP3Gallery(TP3_DATA);
      }
    });
  });

  // -------- Render TP1 (p5.js sketches) --------
  function renderGallery(sketches) {
    galleryGrid.innerHTML = "";
    
    if (sketches.length === 0) {
      galleryGrid.innerHTML = `
        <div class="no-results">
          <p>No se encontraron creadores que coincidan con tu búsqueda.</p>
        </div>
      `;
      return;
    }

    sketches.forEach(sketch => {
      const card = document.createElement("div");
      card.className = "sketch-card";
      
      card.innerHTML = `
        <div class="card-thumb-container">
          <img src="default_placeholder.png" alt="Generative Art Placeholder" class="placeholder-img">
        </div>
        <div class="card-info">
          <h3>${sketch.creator}</h3>
          <p class="sketch-title">${sketch.title}</p>
          <p class="sketch-author-sub">by @${sketch.originalName}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-view" data-url="${sketch.url}" data-creator="${sketch.creator}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Ver en vivo
          </button>
          <a href="${sketch.url}" target="_blank" class="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Abrir Editor
          </a>
        </div>
      `;

      galleryGrid.appendChild(card);

      // Setup Hover interactive iframe loader
      const thumbContainer = card.querySelector(".card-thumb-container");
      const embedUrl = getEmbedUrl(sketch.url);
      let iframe = null;

      card.addEventListener("mouseenter", () => {
        if (!iframe) {
          iframe = document.createElement("iframe");
          iframe.className = "preview-iframe";
          iframe.src = embedUrl;
          iframe.title = `${sketch.creator} p5.js Live Hover Preview`;
          iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
          thumbContainer.appendChild(iframe);
        }
      });

      card.addEventListener("mouseleave", () => {
        if (iframe) {
          iframe.src = "about:blank";
          iframe.remove();
          iframe = null;
        }
      });
    });

    // Wire up view modal triggers
    document.querySelectorAll(".btn-view").forEach(button => {
      button.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const originalUrl = target.getAttribute("data-url");
        const creatorName = target.getAttribute("data-creator");
        openModal(originalUrl, creatorName);
      });
    });
  }

  // -------- Render TP2 (GitHub Pages) --------
  function renderTP2Gallery(projects) {
    galleryGridTp2.innerHTML = "";

    projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "sketch-card";

      let buttonsHtml = "";
      if (project.pageUrl) {
        buttonsHtml += `<a href="${project.pageUrl}" target="_blank" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Ver Sitio
        </a>`;
      }
      if (project.repoUrl) {
        buttonsHtml += `<a href="${project.repoUrl}" target="_blank" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          GitHub
        </a>`;
      }

      const descHtml = project.description
        ? `<p class="sketch-title">${project.description}</p>`
        : `<p class="sketch-title" style="color: var(--text-muted);font-style:italic;">${project.title}</p>`;

      card.innerHTML = `
        <div class="card-thumb-container" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #0d0408, #12030d);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <div class="card-info">
          <h3>${project.creator}</h3>
          ${descHtml}
        </div>
        <div class="card-actions">
          ${buttonsHtml}
        </div>
      `;

      galleryGridTp2.appendChild(card);
    });
  }

  // -------- Render TP3 (Render) --------
  function renderTP3Gallery(projects) {
    galleryGridTp3.innerHTML = "";

    projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "sketch-card";

      let buttonsHtml = "";
      if (project.pageUrl) {
        buttonsHtml += `<a href="${project.pageUrl}" target="_blank" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Ver App
        </a>`;
      }
      if (project.repoUrl) {
        buttonsHtml += `<a href="${project.repoUrl}" target="_blank" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          GitHub
        </a>`;
      }

      const descHtml = project.description
        ? `<p class="sketch-title">${project.description}</p>`
        : `<p class="sketch-title" style="color: var(--text-muted);font-style:italic;">${project.title}</p>`;

      card.innerHTML = `
        <div class="card-thumb-container" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #0a0306, #1a0510);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 7 L16 12 L23 17"></path>
            <path d="M1 7 L8 12 L1 17"></path>
            <line x1="14" y1="3" x2="10" y2="21"></line>
          </svg>
        </div>
        <div class="card-info">
          <h3>${project.creator}</h3>
          ${descHtml}
        </div>
        <div class="card-actions">
          ${buttonsHtml}
        </div>
      `;

      galleryGridTp3.appendChild(card);
    });
  }

  // -------- Modal Logic --------
  function openModal(originalUrl, creatorName) {
    const embedUrl = getEmbedUrl(originalUrl);
    modalTitle.textContent = `${creatorName} - Sketch Preview`;
    modalExternalLink.href = originalUrl;
    
    loadingIndicator.style.display = "flex";
    modalIframe.style.display = "none";
    modalIframe.src = embedUrl;
    
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    modalIframe.src = "about:blank";
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  modalIframe.addEventListener("load", () => {
    if (modalIframe.src !== "about:blank") {
      loadingIndicator.style.display = "none";
      modalIframe.style.display = "block";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // -------- Search Filter (TP1 only) --------
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = SKETCHES_DATA.filter(sketch => 
        sketch.creator.toLowerCase().includes(query) || 
        sketch.title.toLowerCase().includes(query) ||
        sketch.originalName.toLowerCase().includes(query)
      );
      renderGallery(filtered);
    });
  }

  // -------- Initial Render --------
  if (galleryGrid) {
    renderGallery(SKETCHES_DATA);
  }
  
  // -------- Update tab counts dynamically --------
  const tabTp1 = document.getElementById('tab-tp1');
  const tabTp2 = document.getElementById('tab-tp2');
  const tabTp3 = document.getElementById('tab-tp3');
  if (tabTp1) tabTp1.querySelector('.tab-count').textContent = `${SKETCHES_DATA.length} sketches`;
  if (tabTp2) tabTp2.querySelector('.tab-count').textContent = `${TP2_DATA.length} proyectos`;
  if (tabTp3) tabTp3.querySelector('.tab-count').textContent = `${TP3_DATA.length} apps`;
});
