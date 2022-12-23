NJCControllers.controller('CharacterCreate', [
    '$routeParams', '$rootScope', '$scope', '$location', '$window', 'ninjaClanService', 'ninjaRankService', 'characterService',
    function ($routeParams, $rootScope, $scope, $location, $window, ninjaClanService, ninjaRankService, characterService) {

        $scope.character = characterService.get();
        $scope.changeName = characterService.setName;
        $scope.updateRank = function (rank) {
            characterService.setRank(rank);
            $scope.character = characterService.get();
        };
        $scope.updateClan = function (clan) {

            characterService.setClan(clan).then(function (character) {
                $scope.character = character;
            });
        };
        $scope.updateName = function (name) {

            characterService.setName(name);
            $scope.character = characterService.get();
        };
        $scope.validate = function () {

            characterService.save();
            location.hash = '#/character/edit/';//TODO: do the same for the return button

        };

        $rootScope.pageColor = '#947bff';
        $rootScope.pageName = 'njc-page-create';

        if (typeof ($routeParams.who) === 'undefined') {
            characterService.reset();
        } else {
            characterService.setCurrent($routeParams.who);
        }

        ninjaRankService.load().then(function (data) {
            $scope.ninjaRanks = data;
        });

        ninjaClanService.load().then(function (data) {
            $scope.ninjaClans = data;
        });

    }
]);