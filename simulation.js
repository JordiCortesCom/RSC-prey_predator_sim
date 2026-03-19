/**
 * Lotka-Volterra prey-predator simulation using the 4th-order Runge-Kutta method.
 *
 * Equations:
 *   dx/dt = alpha * x - beta * x * y
 *   dy/dt = delta * x * y - gamma * y
 */

/**
 * Compute the derivatives of the Lotka-Volterra system.
 * @param {number} x  - Prey population
 * @param {number} y  - Predator population
 * @param {object} p  - Parameters { alpha, beta, delta, gamma }
 * @returns {[number, number]} [dx/dt, dy/dt]
 */
function derivatives(x, y, p) {
  var dxdt = p.alpha * x - p.beta * x * y;
  var dydt = p.delta * x * y - p.gamma * y;
  return [dxdt, dydt];
}

/**
 * Run the Lotka-Volterra simulation.
 * @param {object} params - { alpha, beta, delta, gamma, x0, y0, tMax, dt }
 * @returns {{ t: number[], x: number[], y: number[] }}
 */
function runSimulation(params) {
  var alpha = params.alpha;
  var beta = params.beta;
  var delta = params.delta;
  var gamma = params.gamma;
  var x0 = params.x0;
  var y0 = params.y0;
  var tMax = params.tMax;
  var dt = params.dt;

  var p = { alpha: alpha, beta: beta, delta: delta, gamma: gamma };
  var steps = Math.ceil(tMax / dt);

  var tArr = new Array(steps + 1);
  var xArr = new Array(steps + 1);
  var yArr = new Array(steps + 1);

  tArr[0] = 0;
  xArr[0] = x0;
  yArr[0] = y0;

  var x = x0;
  var y = y0;

  for (var i = 0; i < steps; i++) {
    // RK4 integration
    var k1 = derivatives(x, y, p);
    var k2 = derivatives(x + 0.5 * dt * k1[0], y + 0.5 * dt * k1[1], p);
    var k3 = derivatives(x + 0.5 * dt * k2[0], y + 0.5 * dt * k2[1], p);
    var k4 = derivatives(x + dt * k3[0], y + dt * k3[1], p);

    x = x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y = y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);

    // Prevent negative populations
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    tArr[i + 1] = (i + 1) * dt;
    xArr[i + 1] = x;
    yArr[i + 1] = y;
  }

  return { t: tArr, x: xArr, y: yArr };
}
