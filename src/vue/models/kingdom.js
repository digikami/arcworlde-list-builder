import BaseModel from './base-model';
import Faction from './faction';

class Kingdom extends BaseModel {
  constructor(data) {
    super(data);
  }

  loadFactions() {
    this.factions = this.factions ?? [];
    return Promise.all(this.get('factions').map((faction) => {
      return Faction.fetch(faction).then((f) => {
        return Promise.all([f.loadCharacters(), f.loadArmoury()]).then(() => {
          this.factions.push(f);
          return f;
        })
      })
    })).then((factions) => {
      this.set('factions', factions);
      this.factions = factions;
      return factions;
    });
  }
}

BaseModel.initClass(Kingdom, 'kingdoms');

export default Kingdom;