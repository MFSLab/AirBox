
(function () {
    'use strict';

    /* ------------------- Configuración ------------------- */
    const PHASES = [
        { label: 'inhala', dur: 4000 }, // lado izquierdo, sube
        { label: 'AGUANTA', dur: 4000 }, // lado superior
        { label: 'exhala', dur: 4000 }, // lado derecho, baja
        { label: 'AGUANTA', dur: 4000 }  // lado inferior
    ];
    const CYCLE = PHASES.reduce((acc, p) => acc + p.dur, 0); // 16000 ms

    /* ------------------- Elementos ------------------- */
    const pathEl = document.getElementById('progressPath');
    const dotEl = document.getElementById('dot');
    const haloEl = document.getElementById('dotHalo');
    const phaseEl = document.getElementById('phase');
    const countEl = document.getElementById('count');
    const toggleBtn = document.getElementById('toggle');

    /* ------------------- Longitud del recorrido ------------------- */
    const LEN = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(LEN);
    pathEl.style.strokeDashoffset = String(LEN);

    /* ------------------- Estado ------------------- */
    let elapsed = 0;      // ms transcurridos dentro del ciclo
    let lastTs = null;
    let running = true;
    let rafId = null;
    let currentIdx = -1;

    /* ------------------- Render ------------------- */
    function render(t) {
        const p = t / CYCLE; // 0 → 1

        // Trazo progresivo
        pathEl.style.strokeDashoffset = String(LEN * (1 - p));

        // Punto en movimiento
        const pt = pathEl.getPointAtLength(LEN * p);
        dotEl.setAttribute('cx', pt.x);
        dotEl.setAttribute('cy', pt.y);
        haloEl.setAttribute('cx', pt.x);
        haloEl.setAttribute('cy', pt.y);

        // Fase actual
        let acc = 0, idx = 0, local = 0;
        for (let i = 0; i < PHASES.length; i++) {
            if (t < acc + PHASES[i].dur) { idx = i; local = t - acc; break; }
            acc += PHASES[i].dur;
        }

        if (idx !== currentIdx) {
            currentIdx = idx;
            phaseEl.textContent = PHASES[idx].label;

            phaseEl.classList.toggle('is-hold', PHASES[idx].label === 'Aguanta');

            phaseEl.classList.remove('animate');
            void phaseEl.offsetWidth;
            phaseEl.classList.add('animate');
        }

        countEl.textContent = String(
            Math.max(1, Math.ceil((PHASES[idx].dur - local) / 1000))
        );


    }

    /* ------------------- Bucle ------------------- */
    function tick(ts) {
        if (!running) return;
        if (lastTs === null) lastTs = ts;

        const dt = Math.min(ts - lastTs, 250); // evita saltos al volver a la pestaña
        lastTs = ts;
        elapsed += dt;

        render(elapsed % CYCLE);
        rafId = requestAnimationFrame(tick);
    }

    /* ------------------- Controles ------------------- */
    function play() {
        if (running) return;
        running = true;
        lastTs = null;
        toggleBtn.textContent = 'Pausar';
        rafId = requestAnimationFrame(tick);
    }

    function pause() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        toggleBtn.textContent = 'Continuar';
    }

    toggleBtn.addEventListener('click', function () {
        running ? pause() : play();
    });

    /* ------------------- Arranque ------------------- */
    render(0);
    rafId = requestAnimationFrame(tick);
})();
