class API {
  loadStaticData() {
    return Promise.all([this._loadKingdoms(), this._loadCommon()]).then((d) => {
      return {
        kingdoms: d[0],
        common: d[1]
      }
    });
  }

  getVersion() {
    return window.alb?.version ?? Math.round(Math.random() * 100000);
  }

  _loadCommon() {
    return fetch('./data/common.json?v=' + this.getVersion()).then(resp => resp.json());
  }

  _loadKingdoms() {
    return fetch('./data/kingdoms.json?v=' + this.getVersion()).then(resp => resp.json()).then(kingdoms => {
      return new Promise((res, rej) => {
        Promise.all(kingdoms.map(kingdom => this._loadFactions(kingdom))).then(() => res(kingdoms));
      });
    });
  }

  _loadFactions(kingdom) {
    if (kingdom.factions) {
      return Promise.all(kingdom.factions.map((facId) => {
        if (typeof(facId) === 'string') {
          // load the extra file
          return fetch(`./data/factions/${facId}.json?v=`${this.getVersion()}).then(resp => resp.json())
        } else {
          // assume we have an inline object
          return Promise.resolve(facId);
        }
      })).then(factions => {
        return new Promise((res,rej) => {
          Promise.all(factions.map(faction => this._loadCharacters(faction))).then(() => res(factions));
        }).then((factions) => {
          kingdom.factions = factions;
          return kingdom;
        });
      });
    } else {
      kingdom.factions = [];
      return Promise.resolve(kingdom);
    } 
  }

  _loadCharacters(faction) {
    if (faction.characters) {
      return Promise.all(faction.characters.map((charId) => {
        if (typeof(charId) === 'string') {
          //load the extra file
          return fetch(`./data/characters/${charId}.json?v=${this.getVersion()}`).then(resp => resp.json())
        } else {
          // assume we have an inline object
          return Promise.resolve(charId);
        }
      })).then(characters => {
        faction.characters = characters;
        return faction;
      })
    } else  {
      faction.characters = [];
      return Promise.resolve(faction);
    }
  }
}

export default new API();