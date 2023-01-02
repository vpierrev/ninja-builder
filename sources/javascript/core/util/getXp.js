const basesXpCost = [0, 15, 35, 60, 90, 125, 165, 210, 260, 315, 375, 440, 510, 585, 675, 775];

/**
 * A utility function to get the amount of xp used in skills and bases.
 * @param {Object} input The character object to get the xp from.
 * @returns {number} The amount of xp used.
 */
const getXp = function (input) {

    let total = 0;

    for (const base in input.bases) {
        total += basesXpCost[(input.bases[base] - 1) || 0];
    }

    for (const skill in input.skills) {
        let levelSkill = input.skills[skill] || 1;
        total += (levelSkill * levelSkill + levelSkill - 2) / 2;
    }

    total = Math.max(total, 0);

    return input.xp - total;
};