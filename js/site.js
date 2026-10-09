// Small helpers for the blog and other non-homepage pages. No libraries.
(function () {
  // Reading progress bar on posts.
  var bar = document.querySelector('.read-progress');
  var article = document.querySelector('.blog-post-body');
  if (bar && article) {
    var update = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.setProperty('--p', p.toFixed(4));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Topic filters on the blog list.
  var filters = document.querySelectorAll('.filter');
  var rows = document.querySelectorAll('.post-row');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      rows.forEach(function (row) { row.hidden = !(f === 'all' || row.getAttribute('data-category') === f); });
    });
  });
})();
