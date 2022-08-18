import BaseModel from './base-model';
import Character from './character';
import Equipment from './equipment';

class Faction extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    data.commanderLimit = data.commanderLimit ?? 1;
    super(data);
  }

  loadArmoury() {
    return Promise.all(this.get('armoury').map((armouryItem) => {
      return Equipment.find(armouryItem, this);
    })).then((armoury) => {
      this.set('armoury', armoury);
      return armoury;
    });
  }

  loadCharacters() {
    this.characters = this.characters ?? [];
    return Promise.all(this.get('characters').map((character) => {
      return Character.find(character).then((char) => {
        return char.loadArmoury().then(() => {
          return char;
        })
      })
    })).then((characters) => {
      this.set('characters', characters);
      return characters;
    });
  }

  getCharacterCost(character) {
    let cost = character.get('baseCost');
    if (this.get('cost_modifiers')) {
      this.get('cost_modifiers').forEach((mod) => {
        if (character.matches(mod.match)) {
          cost *= mod.modifier;
        }
      })
    }
    return Math.round(cost);
  }
}

BaseModel.initClass(Faction, 'factions');

export default Faction;