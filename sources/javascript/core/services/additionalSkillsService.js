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

    var defer;
    var skills;

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

        }

    };

}]);
