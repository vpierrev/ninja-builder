NJCControllers.filter('clan', function () {

  return function (input, short) {

    var name = '???';

    if (input && input.clan) {
      name = input.clan.name;
    }

    if (short !== true) {
      name = ' du clan ' + name;
    }

    return name;

  };

});
