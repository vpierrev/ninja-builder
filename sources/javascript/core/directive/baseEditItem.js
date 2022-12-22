/**
 * Create a html element witch will be used to display a base, passing the parameters to the template
 */
NJCControllers.directive('baseEditItem', function () {

    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            value: '=value',
            base: '=base'
        },
        templateUrl: 'views/utils/baseEditItem.html',
    };

});
