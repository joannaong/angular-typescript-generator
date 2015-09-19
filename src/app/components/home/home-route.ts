angular
    .module('app')
    .config(Routes);

function Routes($stateProvider) {
    var home = {
        url: '/',
        views: {
            'content': {
                controller: 'HomeController as home',
                templateUrl: 'components/home/home.html'
            }
        }
    };
    $stateProvider.state('home', home);
}
