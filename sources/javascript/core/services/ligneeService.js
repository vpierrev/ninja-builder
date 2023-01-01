NJCApp.factory('ligneeService', ['$q', '$http', 'ninjaClanService', function ($q, $http, ninjaClanService) {

    let defer;
    let lignees;

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

            let httpRequest = $http({
                method: 'GET',
                url: './assets/ninja-lignee.json'
            }).success(function (data) {
                lignees = data;
                defer.resolve(data);
            });

            return defer.promise;

        },

        getLignee: function (character) {
            if (character.lignee === "clan") {

                return ninjaClanService.getLignee(character.clan);
            } else {

                return this.load().then(function (data) {

                    return data[character.lignee].lignee;
                });
            }
        },

        /**
         * Set the bonuses for the given character's lignee
         * @param {Map} bonusesMap Map of the bonuses
         * @param {String} character The character
         */
        setBonuses(bonusesMap, character) {

            this.getLignee(character).then(function (lignee) {

                Object.entries(lignee).forEach(function (bonuses) {

                    if (bonuses[0] > character.bases.lign) {
                        return;
                    }

                    for (const bonus of bonuses[1]) {

                        const value = getRealBonusValue(bonus, 'lignee');

                        if (bonusesMap.has(JSON.stringify(bonus.on))) {
                            bonusesMap.set(JSON.stringify(bonus.on), bonusesMap.get(JSON.stringify(bonus.on)) + value);
                        } else {
                            bonusesMap.set(JSON.stringify(bonus.on), value);
                        }
                    }
                });
            });
        }
    };
}]);
