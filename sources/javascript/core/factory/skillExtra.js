NJCApp.factory('sSkillExtra', ['$q', '$http', function ($q, $http) {

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

    load: function () {

      if (defer) {
        return defer.promise;
      }

      defer = $q.defer();

      var httpRequest = $http({
        method: 'GET',
        url: './assets/skill-additionnal.json'
      }).success(function (data) {
        skills = data;
        defer.resolve(data);
      });

      return defer.promise;

    },
    getClan: function () {

      return sort(filter(skills, function (item) {
        return item.lignee === false;
      }));

    },
    getMain: function () {

      return sort(filter(skills, function (item) {
        return item.lignee === true;
      }));

    }

  };

}]);
