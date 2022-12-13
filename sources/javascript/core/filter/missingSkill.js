NJCControllers.filter('missingSkill', function () {

  return function (input, $scope) {

    var end = {};
    for (var i in input) {
      if (typeof ($scope.user.competences[input[i].key]) === 'undefined') {
        end[input[i].key] = input[i];
      }
    }

    return end;

  };

});
