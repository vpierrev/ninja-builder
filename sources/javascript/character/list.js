NJCControllers.controller('CharacterList', [
  '$rootScope', '$scope', '$location', '$window', 'sNinjaClan', 'sNinjaRank', 'sUser',
  function ($rootScope, $scope, $location, $window, sNinjaClan, sNinjaRank, sUser) {

    $rootScope.pageColor = '#947bff';
    $rootScope.pageName = 'njc-page-home';

    sUser.setCurrent();

    sUser.getAll().then(function (ninjas) {
      $scope.ninjas = ninjas;
    });

    $scope.setCurrentNinja = function (key) {
      sUser.setCurrent(key, true);
    };

    sNinjaRank.load().then(function (data) {
      $scope.ninjaRanks = data;
    });

    sNinjaClan.load().then(function (data) {
      $scope.ninjaClans = data;
    });

  }
]);
