NJCApp.factory('ninjaRankService', ['$q', '$http', function ($q, $http) {

    var defer;
    return {

        /**
         * Load the ninja ranks from the JSON file
         * @returns {Promise} Promise of the ninja ranks list
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            var httpRequest = $http({
                method: 'GET',
                url: './assets/ninja-rank.json'
            }).success(function (data) {
                defer.resolve(data);
            });

            return defer.promise;

        }

    };

}]);
