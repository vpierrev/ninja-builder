NJCControllers.controller('CharacterList', [
    '$rootScope', '$scope', '$location', '$window', 'ninjaClanService', 'ninjaRankService', 'characterService',
    function ($rootScope, $scope, $location, $window, ninjaClanService, ninjaRankService, characterService) {

        $rootScope.pageColor = '#947bff';
        $rootScope.pageName = 'njc-page-home';

        //set the current character a new one
        characterService.setCurrent();

        characterService.getAll().then(function (ninjas) {
            $scope.ninjas = ninjas;
        });

        $scope.setCurrentNinja = function (key) {
            characterService.setCurrent(key, true);
        };

        ninjaRankService.load().then(function (data) {
            $scope.ninjaRanks = data;
        });

        ninjaClanService.load().then(function (data) {
            $scope.ninjaClans = data;
        });

    }
]);
