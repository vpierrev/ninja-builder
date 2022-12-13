NJCControllers.controller('CharacterEdit', [
  '$rootScope', '$scope', '$location', '$window', 'sCharacterBase', 'sSkillCommon', 'sSkillExtra', 'sUser',
  function ($rootScope, $scope, $location, $window, sCharacterBase, sSkillCommon, sSkillExtra, sUser) {

    function checkCanAddSkill() {

      sUser.hasSkillSlot().then(function () {
        $scope.addSkillButton = true;
      }).catch(function () {
        $scope.addSkillButton = false;
        $scope.addSkillList = false;
      });

    }

    $rootScope.pageColor = '#ff7b7b';
    $rootScope.pageName = 'njc-page-edit';
    $scope.user = sUser.get();
    $scope.addSkillList = false;
    $scope.addSkillButton = false;

    window.ga('send', 'pageview', {
      "page": $location.url(),
      "title": "Fiche",
      "dimension1": $scope.user.clan.name
    });

    $scope.deleteCurrent = function () {

      sUser.remove(true);

      window.ga('send', 'event', {
        "eventCategory": "user",
        "eventAction": "remove"
      });

    };

    $scope.setBase = function (base, value) {
      sUser.setBase(base, value);
      checkCanAddSkill();
    };

    $scope.setSkill = function (skill, value) {
      sUser.setSkill(skill, value);
    };

    $scope.toggleAddSkill = function () {
      $scope.addSkillList = !$scope.addSkillList;
    };
    $scope.addSkill = function (skill) {

      sUser.addSkill(skill);
      checkCanAddSkill();

    };

    $scope.changeValue = function () {

      window.ga('send', 'event', {
        "eventCategory": "xp",
        "eventAction": "change"
      });

    };

    $scope.currentCharacter = localStorage.getItem('currentCharacter');

    sCharacterBase.load().then(function (data) {
      $scope.characterBases = data;
    });

    sSkillCommon.load().then(function (data) {
      $scope.commonSkills = data;
    });

    sSkillExtra.load().then(function (data) {

      $scope.additionnalSkills = data;
      $scope.additionnalSkillsClan = sSkillExtra.getClan();
      $scope.additionnalSkillsMain = sSkillExtra.getMain();

    });

    checkCanAddSkill();

  }
]);
