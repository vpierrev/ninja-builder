let getRealBonusValue = function (bonus, fromService, data) {

    const characterService = angular.element(document.body).injector().get('characterService');
    const character = characterService.get();

    switch (bonus.value.type) {

        case 'level': {

            switch (fromService) {

                case 'lignee':
                    return character.bases.lign * bonus.value.value;
                case 'skill':
                    return data * bonus.value.value;
                default:
                    return bonus.value.value;
            }
        }

        default:
            return bonus.value.value;
    }
}