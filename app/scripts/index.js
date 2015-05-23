(function() {
  'use strict';
  document.addEventListener('DOMContentLoaded', function() {
    var h1;
    h1 = document.getElementsByTagName('h1');
    if (h1.length > 0) {
      return h1[0].innerText = h1[0].innerText + ' \'Allo';
    }
  }, false);

}).call(this);
