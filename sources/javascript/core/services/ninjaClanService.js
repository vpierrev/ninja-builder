NJCApp.factory('ninjaClanService', ['$q', '$http', function ($q, $http) {

    var defer;
    return {

        /**
         * Load the ninja clans from the JSON file
         * @returns {Promise} Promise of the ninja clans list
         */
        load: function () {

            if (defer) {
                return defer.promise;
            }

            defer = $q.defer();

            var httpRequest = $http({
                method: 'GET',
                url: './assets/ninja-clan.json'
            }).success(function (data) {
                defer.resolve(data);
            });

            return defer.promise;

        },

        getLignee: function (clan) {

            return this.load().then(function (data) {

                return data[clan.key].lignee;
            });
        }

    };

}]);
