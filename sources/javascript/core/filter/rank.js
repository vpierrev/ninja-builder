/**
 * Create a transformer used in html templates.
 * This transformer init the rank list then forward to #filter.
 * @param {Object} character Forwards to #filter.
 * @param {boolean} short Forwards to #filter.
 * @returns {String} The name of the clan.
 */
NJCControllers.filter('rank', ['ninjaRankService', function (ninjaRankService) {

    var ranks = null;
    var serviceInvoked = false;

    /**
     * Return the rank name of the character.
     * @param {Object} character The character to get the rank name from.
     * @param short If true, returns just the name of the rank; else, format it.
     * @returns {*} The name of the rank.
     */
    var filter = function (character, short) {

        var rankName = ranks[character.rank].name;

        if (short !== true) {

            rankName += ' de rang ';

            var rankLetter = 'D';
            var xp = character.xp - getXp(character);

            for (var i in ranks[character.rank].rank) {
                if (xp > ranks[character.rank].rank[i]) {
                    rankLetter = i;
                }
            }

            rankName += rankLetter;

        }

        return rankName;

    };

    return function (input, short) {

        if (ranks === null) {

            if (serviceInvoked === false) {

                serviceInvoked = true;
                ninjaRankService.load().then(function (result) {
                    ranks = result;
                });

            }

            return '';

        } else {
            return filter(input, short);
        }

    };

}]);
