/**
 * Create a html element witch will be used to display a skill, passing the parameters to the template
 */
NJCControllers.directive('skillEditItem', function () {

    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            value: '=value',
            skill: '=skill'
        },
        templateUrl: 'views/utils/skillEditItem.html'
    };

});
