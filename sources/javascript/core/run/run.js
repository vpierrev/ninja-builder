NJCApp.run(['sUser',  function (sUser) {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('updatefound', function() {
      // Une nouvelle version du service worker a été trouvée
      if (confirm("Une nouvelle version est disponible. La charger ?")) {
        window.location.reload();
      }
    });
  }

  var currentCharacter = localStorage.getItem('currentCharacter');
  sUser.setCurrent(currentCharacter);

}]);
