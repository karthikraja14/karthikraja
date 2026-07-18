/**
 * Privacy-friendly Google Analytics (GA4) loader.
 * -------------------------------------------------
 * To ENABLE analytics: set MEASUREMENT_ID below to your GA4 ID (e.g. 'G-XXXXXXXXXX').
 * While it is empty, NO tracking script loads and NO data is collected.
 */
(function () {
  var MEASUREMENT_ID = ''; // <-- paste your GA4 Measurement ID here, e.g. 'G-XXXXXXXXXX'

  if (!MEASUREMENT_ID) return; // analytics disabled until an ID is provided

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
})();
