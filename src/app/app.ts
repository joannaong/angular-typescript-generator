/// <reference path="../../typings/tsd.d.ts" />

angular.module('app', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ui.router',
    'app.templates'
]);

angular
  .module('app')
  .config(Config);

function Config($urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
}
