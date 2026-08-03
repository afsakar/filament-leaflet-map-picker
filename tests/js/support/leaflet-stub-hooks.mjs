// Leaflet touches `window`/`document` at import time, so tests that only need the
// component object swap it for an empty module.
export function resolve(specifier, context, nextResolve) {
    if (specifier === 'leaflet') {
        return { url: 'data:text/javascript,export default {};', shortCircuit: true };
    }

    return nextResolve(specifier, context);
}
