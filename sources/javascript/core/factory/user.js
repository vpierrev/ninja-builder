NJCApp.factory('sUser', [
  '$q', 'sCharacterBase', 'sSkillCommon', 'sSkillExtra', 'sNinjaRank', 'sNinjaClan',
  function ($q, sCharacterBase, sSkillCommon, sSkillExtra, sNinjaRank, sNinjaClan) {

    var _user = null;

    function _getMaxBase() {

      var max = 1;
      for (var base in _user.bases) {
        max = Math.max(max, _user.bases[base]);
      }

      return max;

    }

    return {

      addSkill: function (skill) {

        return this.hasSkillSlot().then(function () {

          _user.competences[skill] = 1;
          _user.additionnalCompetencesCount += 1;
          this.save();

          window.ga('send', 'event', {
            "eventCategory": "skill",
            "eventAction": "add",
            "dimension2": skill
          });

          return $q.resolve();

        }.bind(this));

      },

      checkIntegrity: function (_user) {

        var defer = $q.defer();

        $q.all([
          sSkillCommon.load(),
          sSkillExtra.load(),
          sNinjaClan.load()
        ]).then(function (args) {

          // Set an explicit clan for the ninja, not just the key
          _user.clan = args[2][_user.clan.key || _user.clan];

          var i;
          // Integrity of the competences: checking missing competences
          for (i in args[0]) {
            if (_user.competences.hasOwnProperty(i) === false) {
              _user.competences[i] = 1;
            }
          }
          // Integrity of the competences: removing obsolete competences
          for (i in _user.competences) {
            if (args[0].hasOwnProperty(i) === false && args[1].hasOwnProperty(i) === false) {
              delete _user.competences[i];
            }
          }
          // Integrity of the competences: sort based on the conf files
          var tempCompetences = {};
          for (i in args[0]) {
            tempCompetences[i] = _user.competences[i];
          }
          for (i in args[1]) {
            if (_user.competences.hasOwnProperty(i)) {
              tempCompetences[i] = _user.competences[i];
            }
          }

          _user.competences = tempCompetences;

          defer.resolve();

        }.bind(this));

        return defer.promise;

      },

      get: function () {

        return _user;

      },
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

      getSkillValues: function (selectedSkill) {

        var base = _user.bases[selectedSkill.base.toLowerCase()];
        var skill = _user.competences[selectedSkill.key];
        var clan = 0;
        for (var level in _user.clan.lignee) {

          if (_user.clan.lignee[level] === selectedSkill.key && _user.bases.lign >= level) {
            clan += Math.ceil(_user.bases.lign / 2);
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

      hasSkillSlot: function () {

        var defer = $q.defer();

        sNinjaRank.load().then(function (data) {

          var targetCount = data[_user.rank].skill;
          if (data[_user.rank].baseMax > _getMaxBase()) {
            targetCount -= 1;
          }

          if (targetCount > _user.additionnalCompetencesCount) {
            defer.resolve(targetCount);
          } else {
            defer.reject(targetCount);
          }

        }.bind(this));

        return defer.promise;

      },

      setClan: function (key) {

        return sNinjaClan.load().then(function (key, clans) {

          _user.clan = clans[key];
          return _user;

        }.bind(this, key));

      },
      setBase: function (base, add) {

        add = typeof (add) === 'undefined' ? 1 : add;

        var defer = $q.defer();

        sNinjaRank.load().then(function (data) {

          var finalValue = _user.bases[base] + add;
          if (finalValue > data[_user.rank].baseMax) {
            finalValue = data[_user.rank].baseMax;
          } else if (finalValue <= 0) {
            finalValue = 1;
          }

          _user.bases[base] = finalValue;

          for (var skill in _user.competences) {
            this.setSkill(skill, 0);
          }

          this.save();
          defer.resolve();

        }.bind(this));

        return defer.promise;

      },
      setName: function (name) {

        _user.name = name;

      },
      setRank: function (rank) {
        _user.rank = rank;
      },
      setSkill: function (skill, add) {

        add = typeof (add) === 'undefined' ? 1 : add;

        var defer = $q.defer();

        $q.all([
          sSkillCommon.load(),
          sSkillExtra.load()
        ]).then(function (args) {

          var base = (args[0][skill] || args[1][skill]).base.toLowerCase();
          var baseValue = _user.bases[base];
          var finalValue = _user.competences[skill] + add;

          if (finalValue > baseValue + 2) {
            finalValue = baseValue + 2;
          } else if (finalValue <= 0) {
            finalValue = 1;
          }

          _user.competences[skill] = finalValue;

          this.save();
          defer.resolve();

        }.bind(this));

        return defer.promise;

      },

      remove: function (forward) {

        forward = forward || false;

        var current = localStorage.getItem('currentCharacter');
        localStorage.removeItem(current);
        localStorage.removeItem('currentCharacter');

        if (forward === true) {
          location.hash = '#/character/';
        }

      },
      removeSkill: function (key, forward) {

        forward = forward || false;

        delete _user.competences[key];
        _user.additionnalCompetencesCount--;

        this.save();

        if (forward === true) {
          location.hash = '#/character/edit/';
        }

      },

      reset: function () {

        localStorage.removeItem('currentCharacter');
        _user = {
          "bases": {},
          "competences": {},
          "skills": {},
          "rank": "genin",
          "additionnalCompetencesCount": 0,
          "xp": 10
        };

        sCharacterBase.load().then(function (data) {

          for (var i in data) {
            _user.bases[i] = 1;
          }

        });

        sSkillCommon.load().then(function (data) {

          for (var i in data) {
            _user.competences[i] = 1;
          }

        });

      },

      setCurrent: function (who, forward) {

        if (!who) {

          _user = {
            "bases": {},
            "skills": {},
            "rank": "genin",
            "additionnalCompetencesCount": 0,
            "xp": 10
          };

          return $q.when([]);

        }

        localStorage.setItem('currentCharacter', who);

        _user = JSON.parse(localStorage.getItem(who));
        var promise = this.checkIntegrity(_user);

        forward = forward || false;
        if (forward === true) {
          location.hash = '#/character/edit/';
        }

        return promise;

      },

      save: function () {

        var currentCharacter = localStorage.getItem('currentCharacter');

        if (currentCharacter) {
          localStorage.setItem(currentCharacter, JSON.stringify(_user));
        } else {

          var prefix = 'ninja_';
          var i = 0;
          while (localStorage.hasOwnProperty(prefix + i) === true) {
            i++;
          }

          currentCharacter = prefix + i;
          if (_user && _user.name) {

            localStorage.setItem(currentCharacter, JSON.stringify(_user));
            localStorage.setItem('currentCharacter', currentCharacter);

            window.ga('send', 'event', {
              "eventCategory": "user",
              "eventAction": "create",
              "dimension1": _user.clan.name
            });

          }

        }

      }

    };

  }
]);
