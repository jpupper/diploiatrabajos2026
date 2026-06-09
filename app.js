// Core application logic for the p5.js work gallery
document.addEventListener("DOMContentLoaded", () => {
  const galleryGrid = document.getElementById("gallery-grid");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("sketch-modal");
  const modalIframe = document.getElementById("modal-iframe");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");
  const modalExternalLink = document.getElementById("modal-external-link");
  const loadingIndicator = document.getElementById("modal-loading");

  // Helper function to turn standard/full links into embed links
  function getEmbedUrl(url) {
    return url.replace(/\/sketches\/|\/full\//, "/embed/");
  }

  // Render sketches list
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
          <!-- Dynamic hover iframe gets injected here by JS -->
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
        // Build the iframe dynamically when the user hovers over the card
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
        // Destroy the iframe instantly to free resources and halt any audio/sketches
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

  // Modal Open Logic
  function openModal(originalUrl, creatorName) {
    const embedUrl = getEmbedUrl(originalUrl);
    modalTitle.textContent = `${creatorName} - Sketch Preview`;
    modalExternalLink.href = originalUrl;
    
    // Show spinner and reset iframe source
    loadingIndicator.style.display = "flex";
    modalIframe.style.display = "none";
    modalIframe.src = embedUrl;
    
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  // Modal Close Logic
  function closeModal() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    // Clear src to stop running p5.js audio/computations instantly
    modalIframe.src = "about:blank";
  }

  // Register Modal Listeners
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Remove loading spinner when iframe completes load
  modalIframe.addEventListener("load", () => {
    if (modalIframe.src !== "about:blank") {
      loadingIndicator.style.display = "none";
      modalIframe.style.display = "block";
    }
  });

  // Escape key closes modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Search Filter logic
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

  // Initial Gallery Render
  if (galleryGrid) {
    renderGallery(SKETCHES_DATA);
  }
});
