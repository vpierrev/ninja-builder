NJCControllers.controller('skillDetail', [
    '$routeParams', '$rootScope', '$scope', '$location', '$window', 'skillBasesService', 'skillCommonService',
    'additionalSkillsService', 'characterService',
    function (
        $routeParams, $rootScope, $scope, $location, $window, skillBasesService, skillCommonService,
        additionalSkillsService, characterService
    ) {

        $rootScope.pageColor = '#ff7b7b';
        $rootScope.pageName = 'njc-page-skill';

        $scope.isAdditional = false;
        $scope.deleteSkill = function (key) {

            characterService.removeSkill(key, true);
        };

        skillBasesService.load().then(function (data) {

            $scope.characterBases = data;

            skillCommonService.load().then(function (data) {
                $scope.commonSkills = data;
                if (data[$routeParams.key]) {
                    $scope.skill = data[$routeParams.key];
                    $scope.score = characterService.getSkillValues($scope.skill);
                    $scope.isAdditional = false;
                    $scope.base = $scope.characterBases[data[$routeParams.key].base.toLowerCase()];
                }
            });

            additionalSkillsService.load().then(function (data) {
                $scope.additionalSkills = data;
                if (data[$routeParams.key]) {
                    $scope.skill = data[$routeParams.key];
                    $scope.score = characterService.getSkillValues($scope.skill);
                    $scope.isAdditional = true;
                    $scope.base = $scope.characterBases[data[$routeParams.key].base.toLowerCase()];
                }
            });

        });

    }
]);
