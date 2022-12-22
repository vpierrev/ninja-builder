/**
 * Register all the routes for the application, assigning the controller and the template view to each one.
 */
NJCApp.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/character/', {
        templateUrl: 'views/character/list.html',
        controller: 'CharacterList'
    }).when('/character/create/:who', {
        templateUrl: 'views/character/create.html',
        controller: 'CharacterCreate'
    }).when('/character/create/', {
        templateUrl: 'views/character/create.html',
        controller: 'CharacterCreate'
    }).when('/character/edit/', {
        templateUrl: 'views/character/edit.html',
        controller: 'CharacterEdit'
    }).when('/skill/detail/:key', {
        templateUrl: 'views/skill/detail.html',
        controller: 'skillDetail'
    }).otherwise({
        redirectTo: '/character/'
    });

}]);
