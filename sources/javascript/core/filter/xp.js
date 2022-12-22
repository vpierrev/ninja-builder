/**
 * Create a transformer used in html templates.
 * This transformer makes #getXp() usable in templates.
 */
NJCControllers.filter('xp', function () {

    return getXp;

});
