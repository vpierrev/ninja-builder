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
