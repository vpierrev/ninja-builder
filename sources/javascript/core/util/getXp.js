/**
 * A utility function to get the amount of xp used in skills and bases.
 * @param input The character object to get the xp from.
 * @returns {number} The amount of xp used.
 */
var getXp = function (input) {

    var total = 0;

    for (var base in input.bases) {
        var levelBase = input.bases[base] || 1;
        while (levelBase > 1) {
            total += (5 + levelBase * 5);
            levelBase--;
        }
    }

    for (var skill in input.skills) {
        var levelSkill = input.skills[skill] || 1;
        while (levelSkill > 1) {
            total += levelSkill;
            levelSkill--;
        }
    }

    total -= 35 * 3;
    total = Math.max(total, 0);

    return input.xp - total;

};
