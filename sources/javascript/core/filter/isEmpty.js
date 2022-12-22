/**
 * Create a transformer used in html templates.
 * This transformer takes an object and returns whether it has properties or not.
 * @param {Object} obj The object to check.
 * @returns {boolean} If the object has properties or not.
 */
NJCControllers.filter('isEmpty', function () {

    return function (obj) {

        for (var bar in obj) {
            if (obj.hasOwnProperty(bar)) {
                return false;
            }
        }

        return true;

    };

});
