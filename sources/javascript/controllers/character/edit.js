NJCControllers.controller('CharacterEdit', [
    '$rootScope', '$scope', '$location', '$window', 'skillBasesService', 'skillCommonService', 'additionalSkillsService', 'characterService',
    function ($rootScope, $scope, $location, $window, skillBasesService, skillCommonService, additionalSkillsService, characterService) {

        function checkCanAddSkill() {

            characterService.hasSkillSlot().then(function () {
                $scope.addSkillButton = true;
            }).catch(function () {
                $scope.addSkillButton = false;
                $scope.addSkillList = false;
            });

        }

        $rootScope.pageColor = '#ff7b7b';
        $rootScope.pageName = 'njc-page-edit';
        $scope.character = characterService.get();
        $scope.addSkillList = false;
        $scope.addSkillButton = false;

        $scope.setMaxXp = function () {

            characterService.get().xp = $scope.character.xp;
            characterService.save();
        };

        $scope.deleteCurrent = function () {

            characterService.remove(true);

        };

        $scope.setBase = function (base, value) {
            characterService.addToBase(base, value);
            checkCanAddSkill();
        };

        $scope.setSkill = function (skill, value) {
            characterService.addToSkill(skill, value);
        };

        $scope.toggleAddSkill = function () {
            $scope.addSkillList = !$scope.addSkillList;
        };
        $scope.addSkill = function (skill) {

            characterService.addSkill(skill);
            checkCanAddSkill();
        };

        $scope.currentCharacter = localStorage.getItem('currentCharacter');

        skillBasesService.load().then(function (data) {
            $scope.characterBases = data;
        });

        skillCommonService.load().then(function (data) {
            $scope.commonSkills = data;
        });

        additionalSkillsService.load().then(function (data) {

            $scope.additionalSkills = data;
            $scope.additionalSkillsClan = additionalSkillsService.getClan();
            $scope.additionalSkillsMain = additionalSkillsService.getMain();

        });

        checkCanAddSkill();

    }
]);
