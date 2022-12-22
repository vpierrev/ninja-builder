/**
 * Create a transformer used in html templates.
 * This transformer takes a list of skills and returns the same list without the skill that the current character has.
 * @param {Object} input The list of skills to filter.
 * @returns {String} The filtered list.
 */
NJCControllers.filter('missingSkill', function () {

    return function (input, $scope) {

        var result = {};
        for (var i in input) {
            if (typeof ($scope.character.skills[input[i].key]) === 'undefined') {
                result[input[i].key] = input[i];
            }
        }

        return result;

    };

});
