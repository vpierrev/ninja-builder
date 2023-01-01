NJCApp.factory('characterService', [
    '$q', 'skillBasesService', 'skillCommonService', 'additionalSkillsService', 'ninjaRankService', 'ninjaClanService', 'chakraSpeService', 'ligneeService',
    function ($q, skillBasesService, skillCommonService, additionalSkillsService, ninjaRankService, ninjaClanService, chakraSpeService, ligneeService) {

        return {

            currentCharacter: null,

            currentCharacterBonuses: new Map(),

            defaultCharacter: {
                "bases": {"cor":1,"esp":1,"arm":1,"tai":1,"nin":1,"gen":1,"lign":1},
                "skills": {},
                "clan": {
                    "key": "aburame",
                    "name": "Aburame",
                    "lignee": {}
                },
                "lignee": "clan",
                "chakraSpes": [],
                "rank": "genin",
                "additionalSkillsCount": 0,
                "xp": 10,
                "name": "",
                "nindoText": "",
                "nindoPoints": 2
            },

            initBonuses: function () {

                $q.all([chakraSpeService.load(), additionalSkillsService.load(), skillCommonService.load(), ligneeService.load()]).then(() => {

                    this.currentCharacterBonuses = new Map();
                    chakraSpeService.setBonuses(this.currentCharacterBonuses, this.currentCharacter.chakraSpes);
                    additionalSkillsService.setBonuses(this.currentCharacterBonuses, this.currentCharacter.skills);
                    skillCommonService.setBonuses(this.currentCharacterBonuses, this.currentCharacter.skills);
                    ligneeService.setBonuses(this.currentCharacterBonuses, this.currentCharacter);
                });

            },

            getBonus: function (bonus) {

                if (this.currentCharacterBonuses.has(JSON.stringify(bonus))) {
                    return this.currentCharacterBonuses.get(JSON.stringify(bonus));
                }

                return 0;
            },

            /**
             * Get the highest base of the character
             * @returns {number} The highest base
             * @private
             */
            _getMaxBase: function () {

                let max = 1;
                for (const base in this.currentCharacter.bases) {
                    max = Math.max(max, this.getBase(base));
                }

                return max;
            },

            /**
             * Get the skill slots of the character
             * @returns {number} The skill slots
             * @private
             */
            _getMaxSkillCount: function () {

                let max = 5;
                const maxBase = this._getMaxBase();

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

                const defer = $q.defer();

                $q.all([
                    skillCommonService.load(),
                    additionalSkillsService.load(),
                    ninjaClanService.load()
                ]).then(function (args) {

                    // Set an explicit clan for the ninja, not just the key
                    character.clan = args[2][character.clan.key || character.clan];

                    let i;
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
                    const tempSkills = {};
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

                const ninjas = {};
                const promises = [];

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
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

                const base = this.getBase(selectedSkill.base.toLowerCase());
                const skill = this.currentCharacter.skills[selectedSkill.key];
                let clan = 0;
                for (const level in this.currentCharacter.clan.lignee) {

                    if (this.currentCharacter.clan.lignee[level] === selectedSkill.key && this.getBase('lign') >= level) {
                        clan += Math.ceil(this.getBase('lign') / 2);
                    }

                }

                const total = base + skill + clan;

                return {
                    "base": base,
                    "skill": skill,
                    "clan": clan,
                    "total": total
                };

            },

            /**
             * Get the vigor of the character
             * @param {Boolean} includeBonus If false, the bonus will not be included
             * @param {String} specific If set, the vigor will be calculated for the given specific resistance
             * @returns {number} The vigor
             */
            getVigor: function (includeBonus = true, specific) {

                return 2 + this.getBase('cor') + (includeBonus ? this.getBonus({"type": "stat", "target": "vigor"}) : 0) + this.getBonus({"type": "stat", "target": ("res" + specific)}); //TODO: add the clan bonus (and armor bonus ?)
            },

            /**
             * Get the character of the character
             * @param {Boolean} includeBonus If false, the bonus will not be included
             * @param {String} specific If set, the vigor will be calculated for the given specific resistance
             * @returns {*}
             */
            getCharacter: function (includeBonus = true, specific) {

                return 2 + this.getBase('esp') + (includeBonus ? this.getBonus({"type": "stat", "target": "character"}) : 0) + this.getBonus({"type": "stat", "target": "res" + specific}); //TODO: add the clan bonus (and armor bonus ?)
            },

            getInitiative: function (asFormula = false, includeBonus = true) {

                return skillCommonService.load().then((data) =>{
                    const elements = [this.getSkillValues(data['physique']).total];
                    if (includeBonus) {
                        elements.push(this.getBonus({"type": "stat", "target": "initiative"}));
                    }

                    if (asFormula) {

                        return "1d10 + " + elements.join(' + ');
                    } else {
                        return "1d10 + " + elements.reduce(function (a, b) {
                            return a + b;
                        });
                    }
                });
            },

            /**
             * Get the specified base of the character
             * @param {String} base The base to get
             * @param {boolean} [includeBonus] If false, the bonus will not be added to the base
             * @returns {number} The base value
             */
            getBase: function (base, includeBonus = false) {

                return this.currentCharacter.bases[base] + (includeBonus ? this.getBonus({"type": "stat", "target": base}) : 0);
            },

            /**
             * Get the chakra of the character
             * @returns {number} The chakra amount
             */
            getChakraTotal: function () {

                return 50 + (30 * this.getBase('cor')) + (30 * this.getBase('esp')) + this.getBonus({"type": "stat", "target": "chakra"}); //TODO: add the clan bonus
            },

            /**
             * Get the chakra regeneration percentage of the character
             * @returns {number} The chakra regeneration percentage
             */
            getChakraRegenPercent: function () {

                return 1 + this.getBonus({"type": "stat", "target": "chakraRegen"}); //TODO: add the clan bonus
            },

            /**
             * Get the chakra regeneration of the character
             * @returns {number} The chakra regeneration
             */
            getChakraRegen: function () {

                return Math.floor(this.getChakraTotal() * this.getChakraRegenPercent() / 100);
            },

            /**
             * Get the amount of chakra control points of the character
             * @returns {number} The amount of chakra control points
             */
            getChakraControl: function () {

                return this.getBase('cor') + this.getBase('esp');
            },

            /**
             * Get the amount of interceptions playable by the character
             * @returns {{max: number, arm: number, tai: number}} The amount of interceptions playable by the character, by type
             */
            getInterceptions: function () {

                let arm = 0;
                let tai = 0;

                let value = this.getBase('arm');
                switch (true) {
                    case value >= 10:
                        arm++;
                    /*falls through*/
                    case value >= 9:
                        arm++;
                    /*falls through*/
                    case value >= 7:
                        arm++;
                    /*falls through*/
                    case value >= 4:
                        arm++;
                    /*falls through*/
                    default:
                        arm++;
                        break;
                }

                value = this.getBase('tai');
                switch (true) {
                    case value >= 10:
                        tai++;
                    /*falls through*/
                    case value >= 9:
                        tai++;
                    /*falls through*/
                    case value >= 7:
                        tai++;
                    /*falls through*/
                    case value >= 4:
                        tai++;
                    /*falls through*/
                    default:
                        tai++;
                        break;
                }

                let max = Math.max(arm, tai);
                return {
                    "arm": arm,
                    "tai": tai,
                    "max": max
                }
            },

            /**
             * Get the max amount of chakra spes of the character
             * @returns {number} The max amount of chakra spes
             */
            getMaxChakraSpes: function () {

                let max = 0;
                let chakraControl = this.getChakraControl();
                switch (true) {
                    case chakraControl >= 24:
                        max += 5;
                    /*falls through*/
                    case chakraControl >= 20:
                        max += 3;
                    /*falls through*/
                    case chakraControl >= 14:
                        max += 2;
                    /*falls through*/
                    case chakraControl >= 10:
                        max += 2;
                    /*falls through*/
                    case chakraControl >= 5:
                        max += 1;
                    /*falls through*/
                    case chakraControl >= 2:
                        max += 1;

                }

                return max;
            },

            /**
             * Add a chakra spe <amount> time to the character
             * @param chakraSpe The chakra spe to add
             * @param amount The amount to add
             */
            addChakraSpe: function (chakraSpe, amount) {

                amount = !!amount ? amount : 1;

                chakraSpeService.load().then((chakraSpeList) => {

                    if (!chakraSpeList.hasOwnProperty(chakraSpe)) {
                        return;
                    }

                    if (this.getMaxChakraSpes() < this.currentCharacter.chakraSpes.length + amount) {
                        return;
                    }

                    if (this.getChakraSpeAmount(chakraSpe) + amount > chakraSpeList[chakraSpe].max) {
                        return;
                    }

                    for (let i = 0; i < amount; i++) {
                        this.currentCharacter.chakraSpes.push(chakraSpe);
                    }

                    this.initBonuses();
                    this.save();
                });
            },

            /**
             * Remove a chakra spe one time or completely from the character
             * @param chakraSpe The chakra spe to remove
             * @param all If true, remove all occurrences the chakra spe, else remove only one occurrence
             */
            removeChakraSpe: function (chakraSpe, all) {

                if (all) {
                    this.currentCharacter.chakraSpes = this.currentCharacter.chakraSpes.filter(function (item) {
                        return item !== chakraSpe;
                    });
                } else {
                    this.currentCharacter.chakraSpes.splice(this.currentCharacter.chakraSpes.indexOf(chakraSpe), 1);
                }

                this.initBonuses();
                this.save();
            },

            /**
             * Get the amount of a chakra spe of the character
             * @param chakraSpeKey The chakra spe key
             * @returns {number} The amount of this chakra spe
             */
            getChakraSpeAmount: function (chakraSpeKey) {

                let amount = 0;

                for (let chakraSpe of this.currentCharacter.chakraSpes) {
                    if (chakraSpe === chakraSpeKey) {
                        amount++;
                    }
                }

                return amount;
            },

            /**
             * Get the list of the chakra specializations of the character
             * @returns {Object} The list of the chakra specializations of the character
             */
            getChakraSpes: function () {

                return this.currentCharacter.chakraSpes;
            },

            /**
             * Return a promise how throws an error if the character has no remaining skill slot
             * @returns {Promise} The promise
             */
            hasSkillSlot: function () {

                const defer = $q.defer();

                ninjaRankService.load().then(function () {

                    const targetCount = this._getMaxSkillCount();

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

                    this.initBonuses();
                    this.save();

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

                const defer = $q.defer();

                ninjaRankService.load().then(function (data) {

                    const oldMaxSkillCount = this._getMaxSkillCount();

                    let finalValue = this.getBase(base, false) + add;
                    if (finalValue > data[this.currentCharacter.rank].baseMax) {
                        finalValue = data[this.currentCharacter.rank].baseMax;
                    } else if (finalValue <= 0) {
                        finalValue = 1;
                    }

                    this.currentCharacter.bases[base] = finalValue;
                    const newMaxSkillCount = this._getMaxSkillCount();

                    if (((oldMaxSkillCount !== newMaxSkillCount) && (newMaxSkillCount < this.currentCharacter.additionalSkillsCount))
                        || (this.currentCharacter.chakraSpes.length > this.getMaxChakraSpes())) {
                        this.currentCharacter.bases[base] -= add;
                        return;
                    }

                    for (const skill in this.currentCharacter.skills) {
                        this.addToSkill(skill, 0);
                    }

                    this.initBonuses();

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

                const defer = $q.defer();

                $q.all([
                    skillCommonService.load(),
                    additionalSkillsService.load()
                ]).then(function (args) {

                    const base = (args[0][skill] || args[1][skill]).base.toLowerCase();
                    const baseValue = this.getBase(base);
                    let finalValue = this.currentCharacter.skills[skill] + add;

                    if (finalValue > baseValue + 2) {
                        finalValue = baseValue + 2;
                    } else if (finalValue <= 0) {
                        finalValue = 1;
                    }

                    this.currentCharacter.skills[skill] = finalValue;

                    this.initBonuses();

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

                const current = localStorage.getItem('currentCharacter');
                localStorage.removeItem(current);
                localStorage.removeItem('currentCharacter');

                if (forward === true) {
                    location.hash = '#/character/';
                }
            },

            /**
             * Remove the given skill from the character
             * @param key The key of the skill to remove
             * @param forward If true, user will be redirected to the character edition page
             */
            removeSkill: function (key, forward) {

                forward = forward || false;

                delete this.currentCharacter.skills[key];
                this.currentCharacter.additionalSkillsCount--;

                this.initBonuses();

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
                const currentCharacter = structuredClone(this.defaultCharacter);

                skillBasesService.load().then(function (data) {

                    for (const i in data) {
                        currentCharacter.bases[i] = 1;
                    }

                });

                skillCommonService.load().then(function (data) {

                    for (const i in data) {
                        currentCharacter.skills[i] = 1;
                    }

                });

                this.currentCharacter = currentCharacter;

                this.initBonuses();
            },

            /**
             * Set the current character to the passed one. Use the default character if the passed one is undefined.
             * @param {String} who The key of the character to set
             * @param {Boolean} forward If true, the character will be redirected to the character edit page.
             * @returns {Promise} A promise
             */
            setCurrent: function (who, forward) {

                if (!who) {

                    this.currentCharacter = structuredClone(this.defaultCharacter);

                    this.initBonuses();

                    return $q.when([]);
                }

                localStorage.setItem('currentCharacter', who);

                this.currentCharacter = JSON.parse(localStorage.getItem(who));

                const promise = this.checkIntegrity(this.currentCharacter).then(() => {

                    this.initBonuses();
                });

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

                let currentCharacter = localStorage.getItem('currentCharacter');

                if (currentCharacter) {
                    localStorage.setItem(currentCharacter, JSON.stringify(this.currentCharacter));
                } else {

                    const prefix = 'ninja_';
                    let i = 0;
                    while (localStorage.hasOwnProperty(prefix + i) === true) {
                        i++;
                    }

                    currentCharacter = prefix + i;
                    if (currentCharacter && this.currentCharacter.name) {

                        localStorage.setItem(currentCharacter, JSON.stringify(this.currentCharacter));
                        localStorage.setItem('currentCharacter', currentCharacter);

                    }

                }

            }
        };
    }
]);