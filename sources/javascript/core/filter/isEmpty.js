NJCControllers.filter('isEmpty', function () {

  return function (obj) {

    for (var bar in obj) {
      if (obj.hasOwnProperty(bar)) {
        return false;
      }
    }

    return true;

  };

});
