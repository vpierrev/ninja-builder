NJCApp.factory('additionalSkillsService', ['$q', '$http', function ($q, $http) {

    function filter(obj, predicate) {

        var result = {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
                result[key] = obj[key];
            }
        }

        return result;

    }

    function sort(obj) {

        var result = {};

        Object.keys(obj).sort().forEach(function (key) {
            result[key] = obj[key];
        });

        return result;

    }

    let defer;
    let skills;

    return {

        /**
         * Load the list of the additional skills and save it in the skills variable
         * @returns {Promise} Promise of the list of the additional skills
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            var httpRequest = $http({
                method: 'GET',
                url: './assets/skill-additional.json'
            }).success(function (data) {
                skills = data;
                defer.resolve(data);
            });

            return defer.promise;

        },

        /**
         * Get the list of the additional skills, sorted by name, and filtered to keep only the skills that are associated to a clan
         * @returns {Promise} Promise of the list of the reaming skills
         */
        getClan: function () {

            return sort(filter(skills, function (item) {
                return item.lignee === false;
            }));

        },

        /**
         * Get the list of the additional skills, sorted by name, and filtered to remove the skills that are associated to a clan
         * @returns {Promise} Promise of the list of the reaming skills
         */
        getMain: function () {

            return sort(filter(skills, function (item) {
                return item.lignee === true;
            }));

        },

        /**
         * Set the bonuses for the given skills
         * @param {Map} bonusesMap Map of the bonuses
         * @param {Object} givenSkills List of the skills
         */
        setBonuses(bonusesMap, givenSkills) {

            Object.entries(givenSkills).forEach(function (skill) {

                if (!(skill[0] in skills)) {
                    return;
                }

                const skillData = skills[skill[0]];
                const skillLevel = skill[1];

                if (!skillData.bonus) {
                    return;
                }

                for (const bonus of skillData.bonus) {

                    const value = getRealBonusValue(bonus, 'skill', skillLevel);

                    if (bonusesMap.has(JSON.stringify(bonus.on))) {
                        bonusesMap.set(JSON.stringify(bonus.on), bonusesMap.get(JSON.stringify(bonus.on)) + value);
                    } else {
                        bonusesMap.set(JSON.stringify(bonus.on), value);
                    }
                }
            });
        }
    };

}]);
