NJCControllers.filter('rank', ['sNinjaRank', function (sNinjaRank) {

  var data = null;
  var serviceInvoked = false;
  var filter = function (input, short) {

    var rankName = data[input.rank].name;

    if (short !== true) {

      rankName += ' de rang ';

      var rankLetter = 'D';
      var xp = input.xp - getXp(input);

      for (var i in data[input.rank].rank) {
        if (xp > data[input.rank].rank[i]) {
          rankLetter = i;
        }
      }

      rankName += rankLetter;

    }

    return rankName;

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
