NJCControllers.filter('skillTotal', ['sUser', function (sUser) {

  return function (user, skill) {

    return sUser.getSkillValues(skill).total;

  };

}]);
