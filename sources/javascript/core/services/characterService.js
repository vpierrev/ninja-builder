NJCApp.factory('characterService', [
    '$q', 'skillBasesService', 'skillCommonService', 'additionalSkillsService', 'ninjaRankService', 'ninjaClanService',
    function ($q, skillBasesService, skillCommonService, additionalSkillsService, ninjaRankService, ninjaClanService) {

        return {

            currentCharacter: null,

            /**
             * Get the highest base of the character
             * @returns {number} The highest base
             * @private
             */
            _getMaxBase: function () {

                var max = 1;
                for (var base in this.currentCharacter.bases) {
                    max = Math.max(max, this.currentCharacter.bases[base]);
                }

                return max;
            },

            /**
             * Get the skill slots of the character
             * @returns {number} The skill slots
             * @private
             */
            _getMaxSkillCount: function () {

                var max = 5;
                var maxBase = this._getMaxBase();

                switch (true) {
                    case maxBase >= 10:
                        max++;
                    /*falls through*/
                    case maxBase >= 7:
                        max++;
                    /*falls through*/
                    case maxBase >= 5:
                        max++;
                        break;
                }

                return max;
            },

            /**
             * Add the given skill to the current character's skill list
             * @param {String} skill The key of the skill to add
             * @returns {Promise} Promise of the character service
             */
            addSkill: function (skill) {

                this.currentCharacter.skills[skill] = 1;
                this.currentCharacter.additionalSkillsCount += 1;
                this.save();
                return $q.resolve();
            },

            /**
             * Loads the two skills services and the clan service. Then, init the character object from the local storage and check its integrity.
             * @param {Object} character The character object
             * @returns {Promise} The promise of the character service
             */
            checkIntegrity: function (character) {

                var defer = $q.defer();

                $q.all([
                    skillCommonService.load(),
                    additionalSkillsService.load(),
                    ninjaClanService.load()
                ]).then(function (args) {

                    // Set an explicit clan for the ninja, not just the key
                    character.clan = args[2][character.clan.key || character.clan];

                    var i;
                    // Integrity of the skills: checking missing skills
                    for (i in args[0]) {
                        if (character.skills.hasOwnProperty(i) === false) {
                            character.skills[i] = 1;
                        }
                    }
                    // Integrity of the skills: removing obsolete skills
                    for (i in character.skills) {
                        if (args[0].hasOwnProperty(i) === false && args[1].hasOwnProperty(i) === false) {
                            delete character.skills[i];
                        }
                    }
                    // Integrity of the skills: sort based on the conf files
                    var tempSkills = {};
                    for (i in args[0]) {
                        tempSkills[i] = character.skills[i];
                    }
                    for (i in args[1]) {
                        if (character.skills.hasOwnProperty(i)) {
                            tempSkills[i] = character.skills[i];
                        }
                    }

                    character.skills = tempSkills;

                    defer.resolve();

                }.bind(this));

                return defer.promise;

            },

            /**
             * Get the current character
             * @returns {Object} The current character
             */
            get: function () {

                return this.currentCharacter;
            },

            /**
             * Get the list of the user's characters
             * @returns {*}
             */
            getAll: function () {

                var ninjas = {};
                var promises = [];

                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key.indexOf('ninja_') === 0) {
                        ninjas[key] = JSON.parse(localStorage.getItem(key));
                        promises.push(this.checkIntegrity(ninjas[key]));
                    }
                }

                return $q.all(promises).then(function () {
                    return ninjas;
                });

            },

            /**
             * Get information about a skill
             * @param selectedSkill The skill
             * @returns {{total: number, skill: number, clan: number, base: number}} An object containing the information. The total is the sum of the
             * skill, the clan and the base. The skill is the skill value. The clan is the clan bonus. The base is the base value.
             */
            getSkillValues: function (selectedSkill) {

                var base = this.currentCharacter.bases[selectedSkill.base.toLowerCase()];
                var skill = this.currentCharacter.skills[selectedSkill.key];
                var clan = 0;
                for (var level in this.currentCharacter.clan.lignee) {

                    if (this.currentCharacter.clan.lignee[level] === selectedSkill.key && this.currentCharacter.bases.lign >= level) {
                        clan += Math.ceil(this.currentCharacter.bases.lign / 2);
                    }

                }

                var total = base + skill + clan;

                return {
                    "base": base,
                    "skill": skill,
                    "clan": clan,
                    "total": total
                };

            },

            /**
             * Return a promise how throws an error if the character has no remaining skill slot
             * @returns {Promise} The promise
             */
            hasSkillSlot: function () {

                var defer = $q.defer();

                ninjaRankService.load().then(function (data) {

                    var targetCount = this._getMaxSkillCount();

                    /*
                    Je n'ai pas compris pourquoi ce code était là, je l'ai commenté pour être sûr

                    if (data[this.currentCharacter.rank].baseMax > _getMaxBase()) {
                      targetCount -= 1;
                    }*/

                    if (targetCount > this.currentCharacter.additionalSkillsCount) {
                        defer.resolve(targetCount);
                    } else {
                        defer.reject(targetCount);
                    }

                }.bind(this));

                return defer.promise;

            },

            /**
             * Load the clan service and set the clan of the character to the clan who corresponds to the given key
             * @param {String} key The key of the clan
             * @returns {Promise} A promise with the character, the clan key and the clan list
             */
            setClan: function (key) {

                return ninjaClanService.load().then(function (key, clans) {

                    this.currentCharacter.clan = clans[key];
                    return this.currentCharacter;
                }.bind(this, key));

            },

            /**
             * Load the rank service and add the given value to the given base, doing the necessary checks to avoid illegal states
             * @param {String} base The base to set
             * @param {number} add The value to add to the base
             * @returns {Promise} A promise
             */
            addToBase: function (base, add) {

                add = typeof (add) === 'undefined' ? 1 : add;

                var defer = $q.defer();

                ninjaRankService.load().then(function (data) {

                    var oldMaxSkillCount = this._getMaxSkillCount();

                    var finalValue = this.currentCharacter.bases[base] + add;
                    if (finalValue > data[this.currentCharacter.rank].baseMax) {
                        finalValue = data[this.currentCharacter.rank].baseMax;
                    } else if (finalValue <= 0) {
                        finalValue = 1;
                    }

                    this.currentCharacter.bases[base] = finalValue;
                    var newMaxSkillCount = this._getMaxSkillCount();

                    if ((oldMaxSkillCount !== newMaxSkillCount) && (newMaxSkillCount < this.currentCharacter.additionalSkillsCount)) {
                        this.currentCharacter.bases[base] -= add;
                        return;
                    }

                    for (var skill in this.currentCharacter.skills) {
                        this.addToSkill(skill, 0);
                    }

                    this.save();
                    defer.resolve();

                }.bind(this));

                return defer.promise;

            },

            /**
             * Set the character's name
             * @param {String} name The name to set
             */
            setName: function (name) {

                this.currentCharacter.name = name;
            },

            /**
             * Set the character's rank
             * @param {String} rank The rank to set
             */
            setRank: function (rank) {
                this.currentCharacter.rank = rank;
            },

            /**
             * Loads the two skill services.
             * Add the given value to the given skill, doing the necessary checks to avoid illegal states
             * @param {String} skill The skill to add value to
             * @param {number} add The value to add to the skill
             * @returns {Promise} A promise
             */
            addToSkill: function (skill, add) {

                add = typeof (add) === 'undefined' ? 1 : add;

                var defer = $q.defer();

                $q.all([
                    skillCommonService.load(),
                    additionalSkillsService.load()
                ]).then(function (args) {

                    var base = (args[0][skill] || args[1][skill]).base.toLowerCase();
                    var baseValue = this.currentCharacter.bases[base];
                    var finalValue = this.currentCharacter.skills[skill] + add;

                    if (finalValue > baseValue + 2) {
                        finalValue = baseValue + 2;
                    } else if (finalValue <= 0) {
                        finalValue = 1;
                    }

                    this.currentCharacter.skills[skill] = finalValue;

                    this.save();
                    defer.resolve();

                }.bind(this));

                return defer.promise;

            },

            /**
             * Remove the current character from the local storage.
             * @param {Boolean} forward If true, the character will be redirected to the character list.
             */
            remove: function (forward) {

                forward = forward || false;

                var current = localStorage.getItem('currentCharacter');
                localStorage.removeItem(current);
                localStorage.removeItem('currentCharacter');

                if (forward === true) {
                    location.hash = '#/character/';
                }
            },

            /**
             *
             * @param key
             * @param forward
             */
            removeSkill: function (key, forward) {

                forward = forward || false;

                delete this.currentCharacter.skills[key];
                this.currentCharacter.additionalSkillsCount--;

                this.save();

                if (forward === true) {
                    location.hash = '#/character/edit/';
                }

            },

            /**
             * replace the current character with the default one.
             */
            reset: function () {

                localStorage.removeItem('currentCharacter');
                var currentCharacter = {
                    "bases": {},
                    "skills": {},
                    "clan": {
                        "key": "aburame",
                        "name": "Aburame",
                        "lignee": {}
                    },
                    "rank": "genin",
                    "additionalSkillsCount": 0,
                    "xp": 10
                };

                skillBasesService.load().then(function (data) {

                    for (var i in data) {
                        currentCharacter.bases[i] = 1;
                    }

                });

                skillCommonService.load().then(function (data) {

                    for (var i in data) {
                        currentCharacter.skills[i] = 1;
                    }

                });

                this.currentCharacter = currentCharacter;
            },

            /**
             * Set the current character to the passed one. Use the default character if the passed one is undefined.
             * @param {Object} who The character to set
             * @param {Boolean} forward If true, the character will be redirected to the character edit page.
             * @returns {Promise} A promise
             */
            setCurrent: function (who, forward) {

                if (!who) {

                    this.currentCharacter = {
                        "bases": {},
                        "skills": {},
                        "clan": {
                            "key": "aburame",
                            "name": "Aburame",
                            "lignee": {}
                        },
                        "rank": "genin",
                        "additionalSkillsCount": 0,
                        "xp": 10
                    };

                    return $q.when([]);

                }

                localStorage.setItem('currentCharacter', who);

                this.currentCharacter = JSON.parse(localStorage.getItem(who));
                var promise = this.checkIntegrity(this.currentCharacter);

                forward = forward || false;
                if (forward === true) {
                    location.hash = '#/character/edit/';
                }

                return promise;

            },

            /**
             * Save the current character to the local storage.
             */
            save: function () {

                var currentCharacter = localStorage.getItem('currentCharacter');

                if (currentCharacter) {
                    localStorage.setItem(currentCharacter, JSON.stringify(this.currentCharacter));
                } else {

                    var prefix = 'ninja_';
                    var i = 0;
                    while (localStorage.hasOwnProperty(prefix + i) === true) {
                        i++;
                    }

                    currentCharacter = prefix + i;
                    if (currentCharacter && this.currentCharacter.name) {

                        localStorage.setItem(currentCharacter, JSON.stringify(this.currentCharacter));
                        localStorage.setItem('currentCharacter', this.currentCharacter);

                    }

                }

            }
        };
    }
]);