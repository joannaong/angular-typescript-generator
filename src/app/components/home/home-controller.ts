angular
    .module('app')
    .controller('HomeController', HomeController);

function HomeController($scope, $state, $timeout) {
    var vm = this;
    console.log('Im the HomeController');
}
