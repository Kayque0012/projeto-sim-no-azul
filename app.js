'use strict';
// Native new-tab links keep this page alive while the measurement request is sent.
// Links continue to work with JavaScript disabled or tracking blocked.
document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', {
          content_name: 'WhatsApp Projeto SIM',
          contact_method: 'whatsapp'
        });
      }
    } catch (_) { /* Navigation must never depend on measurement. */ }
  });
});
// Keep the original query string intact; do not put campaign data in WhatsApp.
