NJCControllers.filter('rank', ['sNinjaRank', function (sNinjaRank) {

  var data = null;
  var serviceInvoked = false;
  var filter = function (input, short) {

    var value = data[input.rank].name;

    if (short !== true) {

      value += ' de rang ';

      var rank = 'D';
      var xp = input.xp - getXp(input);

      for (var i in data[input.rank].rank) {
        if (xp > data[input.rank].rank[i]) {
          rank = i;
        }
      }

      value += rank;

    }

    return value;

  };

  return function (input, short) {

    if (data === null) {

      if (serviceInvoked === false) {

        serviceInvoked = true;
        sNinjaRank.load().then(function (result) {
          data = result;
        });

      }

      return '';

    } else {
      return filter(input, short);
    }

  };

}]);
