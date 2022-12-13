NJCApp.factory('sCharacterBase', ['$q', '$http', function ($q, $http) {

  var defer;
  return {

    load: function () {

      if (defer) {
        return defer.promise;
      }

      defer = $q.defer();

      var httpRequest = $http({
        method: 'GET',
        url: './assets/character-base.json'
      }).success(function (data) {
        defer.resolve(data);
      });

      return defer.promise;

    }

  };

}]);
