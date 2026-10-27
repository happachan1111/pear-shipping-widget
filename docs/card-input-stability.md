# Card input stability (ui39)

The father/aged/valentine/white fallback-data extensions previously called
`renderAll()` unconditionally 2.5 seconds after initialization. That replaced
the inline card inputs while their debounced save still referenced the old DOM.
The save could succeed but the visible replacement template showed zeros.

Remove only those redundant delayed renders. Preserve the initial fallback merge
and the renderAll wrappers, so actual data loads and event switches still merge
fallback records. No saved values, API formats, seed records, or autosave delays
are changed. Forecast and invoice inputs also avoid this unsolicited redraw.

Regression checks must mock all APIs (including startup seed writes). Start
editing before the former timer fires, cover pending debounces and slow saves,
verify visible values/rate, then redraw and reload from the mock store. Check
forecast/invoice drafts remain attached and non-card functionality is unchanged.
