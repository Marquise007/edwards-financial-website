// Cloudflare Pages Function: /schedule
//
// The one place the practice's scheduling link lives. Every "Schedule a
// Conversation" button on the site, the QR code on printed pieces, and any link
// ever handed out points at edwardsfinancialassociates.com/schedule, which lands
// here and forwards to the live scheduler.
//
// To change schedulers (Calendly to Acuity, or anything after that), edit the
// SCHEDULER line below and push. Nothing else on the site, and nothing already
// printed, has to change.
//
// Query parameters on the incoming request are passed through to the scheduler,
// which is how the site's branded popup (schedule-popup.js) themes the calendar.

const SCHEDULER = 'https://calendly.com/jedwards-finance/30min';

export async function onRequest({ request }) {
  const target = new URL(SCHEDULER);
  new URL(request.url).searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return Response.redirect(target.toString(), 302);
}
