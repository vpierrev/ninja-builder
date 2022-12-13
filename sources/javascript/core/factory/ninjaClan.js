NJCApp.factory('sNinjaClan', ['$q', '$http', function ($q, $http) {

  var defer;
  return {

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

    }

  };

}]);
