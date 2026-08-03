export function getEntryInteractionOptions(interactive = true) {
    const enabled = interactive !== false;

    return {
        map: {
            zoomControl: enabled,
            dragging: enabled,
            scrollWheelZoom: enabled,
            doubleClickZoom: enabled,
            boxZoom: enabled,
            keyboard: enabled,
            touchZoom: enabled,
        },
        marker: {
            draggable: false,
            interactive: enabled,
            keyboard: enabled,
        },
    };
}
