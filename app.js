/**
 * Application controller: wires UI controls to the simulation and charts.
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
  var btnReset = document.getElementById('btn-reset');

  /** Read current parameter values from the UI. */
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

  /** Run simulation and draw charts. */
  function simulate() {
    var params = readParams();
    var result = runSimulation(params);
    drawTimeChart(timeCanvas, result);
    drawPhaseChart(phaseCanvas, result);
  }

  /** Reset all sliders to default values. */
  function resetParams() {
    SLIDERS.forEach(function (s) {
      var el = document.getElementById(s.id);
      var defaultVal = DEFAULTS[s.id];
      el.value = defaultVal;
      document.getElementById(s.outputId).textContent = Number(defaultVal).toFixed(s.decimals);
    });
  }

  /** Bind slider input events to update output labels in real time. */
  function bindSliders() {
    SLIDERS.forEach(function (s) {
      var slider = document.getElementById(s.id);
      var output = document.getElementById(s.outputId);
      slider.addEventListener('input', function () {
        output.textContent = Number(slider.value).toFixed(s.decimals);
      });
    });
  }

  /** Handle canvas resizing on window resize. */
  function onResize() {
    // Re-simulate to redraw with correct canvas dimensions
    simulate();
  }

  // Initialize
  bindSliders();
  btnRun.addEventListener('click', simulate);
  btnReset.addEventListener('click', function () {
    resetParams();
    simulate();
  });

  // Debounced resize handler
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 200);
  });

  // Initial simulation
  simulate();
})();
