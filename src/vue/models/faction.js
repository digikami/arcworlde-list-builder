import BaseModel from './base-model';
import Character from './character';
import Equipment from './equipment';
import Trait from './trait';

class Faction extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    data.commanderLimit = data.commanderLimit ?? 1;
    super(data);
  }

  loadData() {
    return this.loadTraits()
      .then(() => this.loadArmoury())
      .then(() => this.loadCharacters())
      .then(() => {
        return this;
      });
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
    return Promise.all(this.get('characters').map((character) => {
      return Character.find(character).then((char) => {
        return char.loadData().then(() => {
          return char;
        })
      })
    })).then((characters) => {
      this.set('characters', characters);
      return characters;
    });
  }

  loadTraits() {
    return Promise.all(this.get('traits').map((trait) => {
      return Trait.find(trait, this);
    })).then((traits) => {
      this.set('traits', traits);
      return traits;
    })
  }

  modifyCharacterCost(character, cost) {
    if (this.get('cost_modifiers')) {
      this.get('cost_modifiers').forEach((mod) => {
        if (character.matches(mod.match)) {
          cost *= mod.modifier;
        }
      })
    }
    return cost;
  }

  getEquipmentCostModifier(equipment, member) {
    let mod = 1;
    // no use case yet
    return mod;
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
    return Math.ceil(cost);
  }
}

BaseModel.initClass(Faction, 'factions');

export default Faction;