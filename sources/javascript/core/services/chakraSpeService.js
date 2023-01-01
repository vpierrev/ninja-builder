NJCApp.factory('chakraSpeService', ['$q', '$http', function ($q, $http) {

    let defer;
    let chakraSpes;

    return {

        /**
         * Load the chakra spe from the JSON file
         * @returns {Promise} Promise of the chakra spe list
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            const httpRequest = $http({
                method: 'GET',
                url: './assets/chakra-spe.json'
            }).success(function (data) {
                chakraSpes = data;
                defer.resolve(data);
            });

            return defer.promise;
        },

        /**
         * Set the bonuses for the given chakra spes
         * @param {Map} bonusesMap Map of the bonuses
         * @param {String[]} chakraSpesNames List of the chakra spes names
         */
        setBonuses(bonusesMap, chakraSpesNames) {

            for (const chakraSpeName of chakraSpesNames) {

                if (chakraSpeName in chakraSpes) {

                    const chakraSpe = chakraSpes[chakraSpeName];

                    for (const bonus of chakraSpe.bonus) {

                        const value = getRealBonusValue(bonus, 'chakraSpe');

                        if (bonusesMap.has(JSON.stringify(bonus.on))) {
                            bonusesMap.set(JSON.stringify(bonus.on), bonusesMap.get(JSON.stringify(bonus.on)) + value);
                        } else {
                            bonusesMap.set(JSON.stringify(bonus.on), value);
                        }
                    }
                }
            }
        }
    };
}]);