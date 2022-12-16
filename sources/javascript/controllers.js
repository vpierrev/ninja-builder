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
