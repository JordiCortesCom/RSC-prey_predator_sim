/**
 * Application controller: wires UI controls to the simulation and charts.
 * Supports animated playback, pause/resume, and real-time parameter updates.
 */
(function () {
  'use strict';

  // Default parameter values
  var DEFAULTS = {
    alpha: 1.1,
    beta: 0.4,
    delta: 0.1,
    gamma: 0.4,
    x0: 10,
    y0: 10,
    tmax: 80,
    dt: 0.02
  };

  // Slider IDs and their corresponding output element IDs
  var SLIDERS = [
    { id: 'alpha', outputId: 'alpha-value', decimals: 2 },
    { id: 'beta', outputId: 'beta-value', decimals: 2 },
    { id: 'delta', outputId: 'delta-value', decimals: 2 },
    { id: 'gamma', outputId: 'gamma-value', decimals: 2 },
    { id: 'x0', outputId: 'x0-value', decimals: 1 },
    { id: 'y0', outputId: 'y0-value', decimals: 1 },
    { id: 'tmax', outputId: 'tmax-value', decimals: 0 },
    { id: 'dt', outputId: 'dt-value', decimals: 3 }
  ];

  var timeCanvas = document.getElementById('time-chart');
  var phaseCanvas = document.getElementById('phase-chart');
  var btnRun = document.getElementById('btn-run');
  var btnPause = document.getElementById('btn-pause');
  var btnReset = document.getElementById('btn-reset');
  var timeDisplay = document.getElementById('time-display');

  // ── Animation state ──────────────────────────────────────────────────────
  var animRunning = false;   // true while the animation loop is active
  var animPaused = false;    // true when the user has paused playback
  var animRafId = null;      // requestAnimationFrame handle
  var animData = null;       // full simulation result ({ t, x, y })
  var animStep = 0;          // index of the last rendered data point

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Read current parameter values from the UI sliders. */
  function readParams() {
    return {
      alpha: parseFloat(document.getElementById('alpha').value),
      beta: parseFloat(document.getElementById('beta').value),
      delta: parseFloat(document.getElementById('delta').value),
      gamma: parseFloat(document.getElementById('gamma').value),
      x0: parseFloat(document.getElementById('x0').value),
      y0: parseFloat(document.getElementById('y0').value),
      tMax: parseFloat(document.getElementById('tmax').value),
      dt: parseFloat(document.getElementById('dt').value)
    };
  }

  /** Return the number of simulation steps to advance per animation frame. */
  function getSpeed() {
    return parseInt(document.getElementById('speed').value, 10) || 10;
  }

  /** Redraw both charts at the current animation position. */
  function redraw() {
    if (!animData) return;
    var upTo = animRunning ? animStep : undefined;
    drawTimeChart(timeCanvas, animData, upTo);
    drawPhaseChart(phaseCanvas, animData, upTo);
    if (timeDisplay) {
      var idx = (upTo !== undefined) ? upTo : animData.t.length - 1;
      timeDisplay.textContent = 't\u00a0=\u00a0' + animData.t[idx].toFixed(2);
    }
  }

  // ── Animation loop ───────────────────────────────────────────────────────

  function scheduleFrame() {
    animRafId = requestAnimationFrame(animationFrame);
  }

  function animationFrame() {
    animRafId = null;
    if (!animRunning || animPaused) return;

    animStep = Math.min(animStep + getSpeed(), animData.t.length - 1);
    redraw();

    if (animStep < animData.t.length - 1) {
      scheduleFrame();
    } else {
      // Animation complete – show full charts with end markers
      animRunning = false;
      animPaused = false;
      redraw(); // upTo=undefined → full view with end point shown
      btnPause.disabled = true;
      btnPause.textContent = '\u23f8 Pausa';
      btnRun.textContent = '\u25b6 Simular';
    }
  }

  // ── Public actions ───────────────────────────────────────────────────────

  /** Stop any running animation and cancel the scheduled frame. */
  function stopAnimation() {
    if (animRafId !== null) {
      cancelAnimationFrame(animRafId);
      animRafId = null;
    }
    animRunning = false;
    animPaused = false;
    btnPause.disabled = true;
    btnPause.textContent = '\u23f8 Pausa';
    btnRun.textContent = '\u25b6 Simular';
  }

  /**
   * (Re-)start the animation from the beginning with the current parameters.
   * Any slider change or "Simular" click triggers this.
   */
  function simulate() {
    stopAnimation();
    animData = runSimulation(readParams());
    animStep = 0;
    animRunning = true;
    animPaused = false;
    btnPause.disabled = false;
    scheduleFrame();
  }

  /** Toggle pause / resume. */
  function togglePause() {
    if (!animRunning) return;
    animPaused = !animPaused;
    if (animPaused) {
      btnPause.textContent = '\u25b6 Reprendre';
      if (animRafId !== null) {
        cancelAnimationFrame(animRafId);
        animRafId = null;
      }
    } else {
      btnPause.textContent = '\u23f8 Pausa';
      scheduleFrame();
    }
  }

  /** Reset all sliders to their default values. */
  function resetParams() {
    SLIDERS.forEach(function (s) {
      var el = document.getElementById(s.id);
      var defaultVal = DEFAULTS[s.id];
      el.value = defaultVal;
      document.getElementById(s.outputId).textContent = Number(defaultVal).toFixed(s.decimals);
    });
    document.getElementById('speed').value = 10;
    document.getElementById('speed-value').textContent = '10';
  }

  // ── Event binding ────────────────────────────────────────────────────────

  /** Bind slider input events: update output labels and restart animation. */
  function bindSliders() {
    SLIDERS.forEach(function (s) {
      var slider = document.getElementById(s.id);
      var output = document.getElementById(s.outputId);
      slider.addEventListener('input', function () {
        output.textContent = Number(slider.value).toFixed(s.decimals);
        // Restart animation so changes are visible immediately
        simulate();
      });
    });

    // Speed slider – only updates the label; no animation restart needed
    var speedSlider = document.getElementById('speed');
    var speedOutput = document.getElementById('speed-value');
    speedSlider.addEventListener('input', function () {
      speedOutput.textContent = speedSlider.value;
    });
  }

  /** Handle canvas resizing: redraw without restarting the animation. */
  function onResize() {
    if (animData && (!animRunning || animPaused)) {
      redraw();
    }
  }

  // ── Tab navigation ───────────────────────────────────────────────────────

  /** Switch between the "simulator" and "teoria" tabs. */
  function initTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        tabs.forEach(function (b) {
            b.classList.remove('tab-btn--active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('tab-btn--active');
          btn.setAttribute('aria-selected', 'true');
        panels.forEach(function (panel) {
          panel.hidden = panel.id !== 'tab-' + target;
        });
      });
    });
  }

  // ── Initialise ───────────────────────────────────────────────────────────
  initTabs();
  bindSliders();
  btnRun.addEventListener('click', simulate);
  btnPause.addEventListener('click', togglePause);
  btnReset.addEventListener('click', function () {
    stopAnimation();
    resetParams();
    simulate();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 200);
  });

  // Run initial animation on page load
  simulate();
})();
