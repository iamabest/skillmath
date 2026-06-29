# Simulation architecture

Project simulations are now opened through the React shell:

- Add catalog metadata in `src/data/simulations.js`.
- Use `component: 'spatial-nets'` for the React Three Fiber spatial net module.
- Use `legacyPath` for older standalone HTML simulations that have not been migrated yet.
- Keep reusable React simulation engines in their own folder under `src/simulations`.

## Spatial nets

`src/simulations/spatial-nets` contains the modern 3D net engine:

- `SpatialNetSimulation.jsx`: React UI, controls, Canvas, animation loop.
- `netShapes.js`: shape registry and geometry builders.

To add a new solid, add an option to `netShapeOptions` and support its geometry in
`buildNetShape`. Prefer data-driven shape definitions over one-off scene code.

## Migration rule

When converting an old simulation:

1. Move math/state logic into a React component.
2. Keep drawing logic isolated from controls.
3. Register the simulation in `src/data/simulations.js`.
4. Point `href` to `./?simulation=<slug>`.
5. Keep the old `legacyPath` only while migration is incomplete.
