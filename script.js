(() => {
  "use strict";

  const FINAL_TEXT =
    "Feliz 23 casi 24 años. Eres una increíble persona y te mereces el mejor cumpleaños del mundo. Por cierto, qué hermosa te ves hoy.";

  const historiaDesktop = [
    {
      id: "miles",
      x: 18,
      y: 74,
      titulo: "Miles · cabeza abajo",
      mensaje:
        "En todos los demás universos, Gwen Stacy se enamora de Spider-Man... y en ninguno termina bien.",
    },
    {
      id: "takis",
      x: 40,
      y: 48,
      titulo: "Takis",
      mensaje: "No comas mucho picante o te va a hacer mal xd",
    },
    {
      id: "bosque",
      x: 24,
      y: 24,
      titulo: "Bosque",
      mensaje: "hard sex here?",
    },
    {
      id: "tiktok",
      x: 58,
      y: 20,
      titulo: "Taektok",
      mensaje:
        "Podemos ser nosotros si me permites estar a tu lado en tu presente y futuro.",
    },
    {
      id: "love",
      x: 78,
      y: 42,
      titulo: "Corazón programado",
      mensaje: "LoveLove — un corazón escrito con código, latiendo solo por ti.",
    },
    {
      id: "luna",
      x: 62,
      y: 70,
      titulo: "Lucy & David M.",
      mensaje: "Te llevo a la luna. Te lo prometo.",
    },
    {
      id: "snoopy",
      x: 88,
      y: 56,
      titulo: "Snoopy te espera",
      mensaje: FINAL_TEXT,
    },
  ];

  const historiaMobile = [
    { ...historiaDesktop[0], x: 50, y: 10 },
    { ...historiaDesktop[1], x: 28, y: 24 },
    { ...historiaDesktop[2], x: 70, y: 38 },
    { ...historiaDesktop[3], x: 32, y: 52 },
    { ...historiaDesktop[4], x: 68, y: 66 },
    { ...historiaDesktop[5], x: 36, y: 80 },
    { ...historiaDesktop[6], x: 52, y: 92 },
  ];

  const mq = window.matchMedia("(max-width: 767px)");
  const nodesEl = document.getElementById("nodes");
  const rabbitEl = document.getElementById("rabbit");
  const trailPath = document.getElementById("trailPath");
  const worldEl = document.getElementById("world");
  const bubbleEl = document.getElementById("bubble");
  const bubbleStep = document.getElementById("bubbleStep");
  const bubbleTitle = document.getElementById("bubbleTitle");
  const bubbleMessage = document.getElementById("bubbleMessage");
  const sceneFrame = document.getElementById("sceneFrame");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const finaleEl = document.getElementById("finale");
  const finaleMessage = document.getElementById("finaleMessage");
  const btnRestart = document.getElementById("btnRestart");
  const btnMusic = document.getElementById("btnMusic");
  const soundtrack = document.getElementById("soundtrack");
  const dotsCanvas = document.getElementById("dotsLayer");

  let currentIndex = 0;
  let maxReached = 0;
  let isMoving = false;
  let confettiFired = false;
  let loveRaf = 0;

  function getHistoria() {
    return mq.matches ? historiaMobile : historiaDesktop;
  }

  function buildNodes() {
    const historia = getHistoria();
    nodesEl.innerHTML = "";
    historia.forEach((punto, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "node";
      btn.dataset.index = String(index);
      btn.style.left = `${punto.x}%`;
      btn.style.top = `${punto.y}%`;
      btn.textContent = String(index + 1);
      btn.setAttribute("aria-label", punto.titulo);
      btn.addEventListener("click", () => onNodeClick(index));
      nodesEl.appendChild(btn);
    });
    drawTrail();
    updateNodeStates();
  }

  function drawTrail() {
    const historia = getHistoria();
    let d = `M ${historia[0].x},${historia[0].y}`;
    for (let i = 1; i < historia.length; i += 1) {
      const prev = historia[i - 1];
      const curr = historia[i];
      const mx = (prev.x + curr.x) / 2;
      const my = (prev.y + curr.y) / 2;
      const bend = i % 2 === 0 ? 8 : -8;
      d += ` Q ${mx + bend * 0.2},${my + bend * 0.35} ${curr.x},${curr.y}`;
    }
    trailPath.setAttribute("d", d);
  }

  function updateNodeStates() {
    nodesEl.querySelectorAll(".node").forEach((btn) => {
      const index = Number(btn.dataset.index);
      btn.classList.toggle("current", index === currentIndex);
      btn.classList.toggle("visited", index < currentIndex);
      btn.classList.toggle("unlocked", index <= maxReached);
      btn.disabled = index > maxReached;
    });
  }

  function updateCamera(index, animate) {
    const historia = getHistoria();
    const punto = historia[index];
    const next = historia[Math.min(index + 1, historia.length - 1)];
    const lookX = punto.x + (next.x - punto.x) * 0.22;
    const lookY = punto.y + (next.y - punto.y) * 0.18;
    worldEl.style.transition = animate
      ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    worldEl.style.transformOrigin = `${lookX}% ${lookY}%`;
    worldEl.style.transform = "translate3d(0, 8%, 0) rotateX(8deg) scale(1.55)";
  }

  function placeRabbit(index, { animate = true, fromIndex = null } = {}) {
    const historia = getHistoria();
    const punto = historia[index];
    rabbitEl.style.transition = animate
      ? "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";

    if (animate && fromIndex !== null && historia[fromIndex]) {
      rabbitEl.classList.toggle("facing-left", punto.x < historia[fromIndex].x);
    }

    rabbitEl.style.left = `${14 + punto.x * 0.72}%`;
    rabbitEl.style.top = `${14 + punto.y * 0.72}%`;
    updateCamera(index, animate);

    if (!animate) {
      void rabbitEl.offsetWidth;
      rabbitEl.style.transition =
        "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    }
  }

  function renderScene(punto) {
    cancelAnimationFrame(loveRaf);
    document.body.dataset.scene = punto.id;

    const scenes = {
      miles: `
        <div class="scene-art miles-scene">
          <span class="miles-web"></span>
          <div class="miles-figure">
            <span class="hoodie"></span>
            <span class="legs"></span>
          </div>
        </div>`,
      takis: `
        <div class="scene-art takis-wrap">
          <div class="takis-bag" id="takisBag">
            <span class="chip" style="--dx:-40px;--dy:-70px;left:40%;top:40%"></span>
            <span class="chip" style="--dx:50px;--dy:-80px;left:55%;top:42%"></span>
            <span class="chip" style="--dx:10px;--dy:-90px;left:48%;top:50%"></span>
            <span class="chip" style="--dx:-20px;--dy:-60px;left:35%;top:48%"></span>
          </div>
        </div>`,
      bosque: `
        <div class="scene-art bosque-scene">
          <p class="hard-text">hard sex here?</p>
        </div>`,
      tiktok: `
        <div class="scene-art tiktok-scene">
          <div class="polaroid">
            <img src="assets/foto-tiktok.jpg" alt="Foto para este recuerdo" />
            <span>nosotros · presente y futuro</span>
          </div>
        </div>`,
      love: `<div class="scene-art love-scene"><canvas id="loveCanvas"></canvas></div>`,
      luna: `
        <div class="scene-art luna-scene">
          <div class="pair">
            <span class="char david" title="David"></span>
            <span class="char lucy" title="Lucy"></span>
          </div>
          <p class="caption-stamp">Te llevo a la luna. Te lo prometo.</p>
        </div>`,
      snoopy: `
        <div class="scene-art snoopy-mini">
          <svg viewBox="0 0 160 140" width="180" height="150">
            <ellipse cx="80" cy="128" rx="36" ry="7" fill="rgba(0,0,0,.2)" />
            <ellipse cx="80" cy="98" rx="28" ry="22" fill="#fff" stroke="#111" stroke-width="3" />
            <circle cx="78" cy="52" r="26" fill="#fff" stroke="#111" stroke-width="3" />
            <path d="M58 44 C40 18 28 38 52 58" fill="#1a1a1a" />
            <circle cx="86" cy="48" r="3.2" fill="#111" />
            <ellipse cx="90" cy="58" rx="7" ry="4" fill="#111" />
            <path d="M28 78 Q8 70 18 92 Q40 88 52 92" fill="#fff" stroke="#111" stroke-width="3" />
            <path d="M108 92 Q120 88 142 92 Q152 70 132 78" fill="#fff" stroke="#111" stroke-width="3" />
          </svg>
        </div>`,
    };

    sceneFrame.innerHTML = scenes[punto.id] || "";

    if (punto.id === "takis") {
      window.setTimeout(() => {
        const bag = document.getElementById("takisBag");
        if (bag) bag.classList.add("open");
      }, 280);
    }

    if (punto.id === "love") {
      startLoveHeart();
    }
  }

  function startLoveHeart() {
    const canvas = document.getElementById("loveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

    function resize() {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    resize();

    const words = ["Love", "Love"];
    let t0 = 0;

    function heartPoint(t, scale) {
      const x = 16 * Math.sin(t) ** 3;
      const y =
        -(13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
      return { x: x * scale, y: y * scale };
    }

    function frame(now) {
      const w = canvas.width;
      const h = canvas.height;
      const beat = 1 + Math.sin(now / 280) * 0.06;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#190610";
      ctx.fillRect(0, 0, w, h);

      const scale = Math.min(w, h) * 0.028 * beat;
      ctx.save();
      ctx.translate(w / 2, h / 2 + 8);
      ctx.rotate(Math.sin(now / 1600) * 0.08);

      for (let i = 0; i < 48; i += 1) {
        const t = (i / 48) * Math.PI * 2;
        const p = heartPoint(t, scale);
        const word = words[i % 2];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t + now / 900);
        ctx.font = `700 ${Math.max(11, scale * 0.9)}px Outfit, sans-serif`;
        ctx.fillStyle = i % 2 === 0 ? "#ff2bd6" : "#3de0ff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 6;
        ctx.fillText(word, -18, 4);
        ctx.restore();
      }

      ctx.restore();
      t0 = now;
      loveRaf = requestAnimationFrame(frame);
    }

    loveRaf = requestAnimationFrame(frame);
  }

  function showMessage(index) {
    const historia = getHistoria();
    const punto = historia[index];
    bubbleEl.classList.remove("updating");
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add("updating");
    bubbleStep.textContent = `Paso ${index + 1} de ${historia.length}`;
    bubbleTitle.textContent = punto.titulo;
    bubbleMessage.textContent = punto.mensaje;
    renderScene(punto);
  }

  function updateControls() {
    const historia = getHistoria();
    const isLast = currentIndex >= historia.length - 1;
    btnPrev.disabled = currentIndex <= 0 || isMoving;
    btnNext.disabled = isMoving;
    btnNext.textContent = isLast ? "Celebrar" : "Siguiente ➔";
  }

  function launchConfetti() {
    if (typeof confetti !== "function") return;
    const colors = ["#3de0ff", "#ff2bd6", "#ffe14a", "#ff3b3b", "#ffffff"];
    const end = Date.now() + 2600;
    (function tick() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(tick);
    })();
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors });
  }

  function openFinale() {
    finaleMessage.textContent = FINAL_TEXT;
    finaleEl.hidden = false;
    if (!confettiFired) {
      confettiFired = true;
      launchConfetti();
    }
  }

  function closeFinale() {
    finaleEl.hidden = true;
  }

  function goTo(index, { fromUser = false } = {}) {
    const historia = getHistoria();
    if (isMoving) return;
    if (index < 0 || index >= historia.length) return;
    if (fromUser && index > maxReached) return;
    if (index === currentIndex && fromUser) {
      showMessage(index);
      if (index === historia.length - 1) openFinale();
      return;
    }

    const previous = currentIndex;
    isMoving = true;
    rabbitEl.classList.add("moving");
    currentIndex = index;
    maxReached = Math.max(maxReached, index);
    placeRabbit(index, { animate: previous !== index, fromIndex: previous });
    showMessage(index);
    updateNodeStates();
    updateControls();

    window.setTimeout(() => {
      isMoving = false;
      rabbitEl.classList.remove("moving");
      updateControls();
      if (currentIndex === historia.length - 1) openFinale();
    }, 850);
  }

  function onNodeClick(index) {
    if (index <= maxReached) goTo(index, { fromUser: true });
  }

  function onNext() {
    const historia = getHistoria();
    if (currentIndex >= historia.length - 1) {
      openFinale();
      return;
    }
    goTo(currentIndex + 1);
  }

  function onPrev() {
    if (currentIndex <= 0) return;
    closeFinale();
    goTo(currentIndex - 1);
  }

  function restart() {
    confettiFired = false;
    closeFinale();
    currentIndex = 0;
    maxReached = 0;
    isMoving = false;
    rabbitEl.classList.remove("moving", "facing-left");
    placeRabbit(0, { animate: false });
    showMessage(0);
    updateNodeStates();
    updateControls();
  }

  function onLayoutChange() {
    buildNodes();
    placeRabbit(currentIndex, { animate: false });
    showMessage(currentIndex);
    updateControls();
  }

  function paintDots() {
    const ctx = dotsCanvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      dotsCanvas.width = window.innerWidth * dpr;
      dotsCanvas.height = window.innerHeight * dpr;
      dotsCanvas.style.width = `${window.innerWidth}px`;
      dotsCanvas.style.height = `${window.innerHeight}px`;
      draw();
    }

    function draw() {
      const w = dotsCanvas.width;
      const h = dotsCanvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0b0710";
      ctx.fillRect(0, 0, w, h);
      const gap = 9 * dpr;
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const n = (Math.sin(x * 0.01) + Math.cos(y * 0.012) + 2) / 4;
          const r = (1.1 + n * 2.2) * dpr;
          const palette = ["#3de0ff", "#ff2bd6", "#ffe14a", "#ff5a5a", "#1b101f"];
          ctx.fillStyle = palette[(x + y) % palette.length];
          ctx.globalAlpha = 0.18 + n * 0.28;
          ctx.beginPath();
          ctx.arc(x + (y % 2) * gap * 0.4, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener("resize", resize);
  }

  async function toggleMusic() {
    if (soundtrack.paused) {
      try {
        await soundtrack.play();
        btnMusic.setAttribute("aria-pressed", "true");
        btnMusic.textContent = "♪ Sonando";
      } catch {
        btnMusic.textContent = "Añade musica.mp3";
      }
    } else {
      soundtrack.pause();
      btnMusic.setAttribute("aria-pressed", "false");
      btnMusic.textContent = "♪ Música";
    }
  }

  soundtrack.addEventListener("error", () => {
    btnMusic.textContent = "Añade musica.mp3";
  });

  btnMusic.addEventListener("click", toggleMusic);
  btnNext.addEventListener("click", onNext);
  btnPrev.addEventListener("click", onPrev);
  btnRestart.addEventListener("click", restart);

  finaleEl.addEventListener("click", (event) => {
    if (event.target === finaleEl) closeFinale();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !finaleEl.hidden) {
      closeFinale();
      return;
    }
    if (event.key === "ArrowRight") onNext();
    if (event.key === "ArrowLeft") onPrev();
  });

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onLayoutChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onLayoutChange);
  }

  paintDots();
  buildNodes();
  placeRabbit(0, { animate: false });
  showMessage(0);
  updateNodeStates();
  updateControls();
})();
