NJCApp.factory('skillBasesService', ['$q', '$http', function ($q, $http) {

    var defer;
    return {

        /**
         * Load the skill bases
         * @returns {Promise} Promise of the skill bases
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            var httpRequest = $http({
                method: 'GET',
                url: './assets/skill-bases.json'
            }).success(function (data) {
                defer.resolve(data);
            });

            return defer.promise;

        }

    };

}]);
