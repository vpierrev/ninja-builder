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
