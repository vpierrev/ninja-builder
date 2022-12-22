/**
 * Create a transformer used in html templates.
 * This transformer takes a character and returns the name of his clan.
 * @param {Object} character The character to get the clan name from.
 * @param {boolean} short If true, returns just the name of the clan; else, format it.
 * @returns {String} The name of the clan.
 */
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
