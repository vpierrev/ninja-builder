NJCApp.factory('skillCommonService', ['$q', '$http', function ($q, $http) {

    var defer;
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
                defer.resolve(data);
            });

            return defer.promise;

        }

    };

}]);
