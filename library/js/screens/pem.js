/* Personal Economic Model screen (pem1): the whole money-flow model as an open canvas.
   Used by PEM, PEMFR (variant 'reviewed') and FWPEM (variant 'reviewed'). The model itself is the
   shared component in js/lib/pem.js; this screen shows it untouched with every feature switched on.
   In the reviewed edition the model's click-through links are off (the component enforces it). */
(function () {
  'use strict';
  const EFA = window.EFA;

  EFA.screen('pem1', {
    title: 'Personal economic model',
    copy: {
      _notes: 'This is your whole financial picture on one page: what comes in, what taxes take first, what you live on today, and what you set aside for later.\n\n- Ask: If you could turn one valve on this picture tomorrow, which one would make the biggest difference for your family?\nPAUSE\n\n- Pick a scenario at the bottom left, or drag any tank level to match the client. Click a tank, valve or label to open its presentation.'
    },
    render(ctx) {
      ctx.el.innerHTML = '';
      // pem1 is the model at its defaults (labels, scenario picker and links on; regulator 80; tax splits 60/40)
      ctx.pem = EFA.lib.pem.mount(ctx, ctx.el, {});
    }
  });
})();
