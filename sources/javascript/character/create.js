NJCControllers.controller('CharacterCreate', [
  '$routeParams', '$rootScope', '$scope', '$location', '$window', 'sNinjaClan', 'sNinjaRank', 'sUser',
  function ($routeParams, $rootScope, $scope, $location, $window, sNinjaClan, sNinjaRank, sUser) {

    $scope.user = sUser.get();
    $scope.changeName = sUser.setName;
    $scope.updateRank = sUser.setRank;
    $scope.updateClan = function (clan) {

      sUser.setClan(clan).then(function (user) {
        $scope.user = user;
      });

    };
    $scope.validate = function () {

      sUser.save();
      location.hash = '#/character/edit/';

    };

    $rootScope.pageColor = '#947bff';
    $rootScope.pageName = 'njc-page-create';

    var trackingData = {
      "page": $location.url()
    };

    if (typeof ($routeParams.who) === 'undefined') {
      sUser.reset();
      trackingData.title = 'Création';
    } else {
      sUser.setCurrent($routeParams.who);
      trackingData.title = 'Edition';
      trackingData.dimension1 = sUser.get().clan;
    }

    window.ga('send', 'pageview', trackingData);

    sNinjaRank.load().then(function (data) {
      $scope.ninjaRanks = data;
    });

    sNinjaClan.load().then(function (data) {
      $scope.ninjaClans = data;
    });

  }
]);
