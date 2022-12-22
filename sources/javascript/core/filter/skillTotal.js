/**
 * Create a transformer used in html templates.
 * This transformer takes a .
 * @param {Object} character The character to get the clan name from.
 * @param {boolean} short If true, returns just the name of the clan; else, format it.
 * @returns {String}
 */
NJCControllers.filter('skillTotal', ['characterService', function (characterService) {

    return function (character, skill) {

        return characterService.getSkillValues(skill).total;

    };

}]);
