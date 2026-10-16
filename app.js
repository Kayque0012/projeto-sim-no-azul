'use strict';

function trackGA(eventName, params) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  } catch (_) {}
}

// Track real WhatsApp CTA clicks in Meta Pixel and GA4.
document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    if (!event.isTrusted) return;

    var position = link.getAttribute('data-cta-position') || 'unknown';

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', {
          content_name: 'WhatsApp Projeto SIM',
          contact_method: 'whatsapp'
        });
      }
    } catch (_) {}

    trackGA('whatsapp_click', {
      cta_position: position,
      link_url: link.href
    });
  });
});

// Engagement: visitor remained on the page for at least 10 seconds.
window.setTimeout(function () {
  trackGA('engaged_10s', { page_location: window.location.href });
}, 10000);

// Engagement: visitor reached at least 50% of the page once.
var scroll50Sent = false;
function maybeTrackScroll50() {
  if (scroll50Sent) return;
  var doc = document.documentElement;
  var scrollTop = window.pageYOffset || doc.scrollTop || 0;
  var viewport = window.innerHeight || doc.clientHeight || 0;
  var fullHeight = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
  if (!fullHeight) return;
  var progress = (scrollTop + viewport) / fullHeight;
  if (progress >= 0.5) {
    scroll50Sent = true;
    trackGA('scroll_50', { page_location: window.location.href });
    window.removeEventListener('scroll', maybeTrackScroll50);
  }
}
window.addEventListener('scroll', maybeTrackScroll50, { passive: true });
maybeTrackScroll50();

// Preserve campaign parameters in the page URL; never append them to WhatsApp text.
