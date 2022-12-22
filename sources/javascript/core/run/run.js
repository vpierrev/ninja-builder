/**
 * Loads the current character from the local storage, and stores it in the characterService current character.
 */
NJCApp.run(['characterService', function (characterService) {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('updatefound', function () {
            // Une nouvelle version du service worker a été trouvée
            if (confirm("Une nouvelle version est disponible. La charger ?")) {
                window.location.reload();
            }
        });
    }

    var currentCharacter = localStorage.getItem('currentCharacter');
    characterService.setCurrent(currentCharacter);

}]);
