NJCApp.factory('skillCommonService', ['$q', '$http', function ($q, $http) {

    let defer;
    let skills;

    return {

        /**
         * Load the list of the skills common to all characters
         * @returns {Promise} Promise of the list of skills
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            var httpRequest = $http({
                method: 'GET',
                url: './assets/skill-common.json'
            }).success(function (data) {
                skills = data;
                defer.resolve(data);
            });

            return defer.promise;

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
