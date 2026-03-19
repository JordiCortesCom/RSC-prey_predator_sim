# RSC-prey_predator_sim

Simulador interactiu del model de **presa-depredador de Lotka-Volterra**, construït com a MVP amb HTML, CSS i JavaScript pur (sense dependències externes).

## Model

Les equacions de Lotka-Volterra descriuen la dinàmica entre dues espècies — una presa i un depredador:

```
dx/dt = αx − βxy
dy/dt = δxy − γy
```

On:
- **x** — Població de preses
- **y** — Població de depredadors
- **α** — Taxa de creixement de la presa
- **β** — Taxa de depredació
- **δ** — Taxa de reproducció del depredador (proporcional a les preses consumides)
- **γ** — Taxa de mortalitat del depredador

## Funcionalitats

- **Visualització temporal**: gràfic de l'evolució de les poblacions de presa i depredador al llarg del temps.
- **Espai de fases**: diagrama de fase que mostra la trajectòria del sistema en l'espai (x, y).
- **Control de paràmetres**: sliders interactius per modificar els paràmetres del model (α, β, δ, γ), les poblacions inicials i la configuració de la simulació.
- **Integració RK4**: resolució numèrica precisa mitjançant el mètode de Runge-Kutta de quart ordre.

## Ús

Obre `index.html` en qualsevol navegador modern. No cal servidor ni instal·lació.

1. Ajusta els paràmetres amb els sliders.
2. Prem **▶ Simular** per executar la simulació.
3. Prem **↺ Reset** per tornar als valors per defecte.

## Estructura

```
RSC-prey_predator_sim/
├── index.html       # Pàgina principal
├── style.css        # Estils
├── simulation.js    # Motor de simulació (Lotka-Volterra + RK4)
├── chart.js         # Visualització amb Canvas
├── app.js           # Controlador de l'aplicació
└── README.md        # Documentació
```
