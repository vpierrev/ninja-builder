if (location.hostname === "builder.naruto-jdr.com") {

  (function (t, s, u, n, a, d, e) {
    t.GoogleAnalyticsObject = a;
    t[a] = t[a] || function () {
      (t[a].q = t[a].q || []).push(arguments);
    };
    t[a].l = 1 * new Date();
    d = s.createElement(u);
    e = s.getElementsByTagName(u)[0];
    d.async = true;
    d.src = n;
    e.parentNode.insertBefore(d, e);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  ga('create', 'UA-37445339-3', 'auto');

} else {
  ga = function () {};
}

var ios = navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('iPad') !== -1;
var modules = [
  'ngRoute',
  'NJCControllers'
];

if (ios === false) {
  modules.push('ngAnimate');
}

NJCApp = angular.module('NJCApp', modules);
NJCControllers = angular.module('NJCControllers', []);
