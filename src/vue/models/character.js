import BaseModel from './base-model';
import Equipment from './equipment';
import Trait from './trait';
import Faction from './faction';

class Character extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    data.equipment = data.equipment ?? []
    data.tags = data.tags ?? [];
    data.species = data.species ?? "unknown";
    super(data);
  }

  loadData() {
    return Promise.all([this.loadArmoury(), this.loadTraits(), this.loadFaction()]).then(() => this);
  }

  loadArmoury() {
    return Promise.all(this.get('armoury').map((armouryItem) => {
      return Equipment.find(armouryItem, this);
    })).then((armoury) => {
      this.set('armoury', armoury);
      return armoury;
    });
  }
  loadTraits() {
    return Promise.all([
      Promise.all(this.get('traits').map((trait) => {
        return Trait.find(trait, this);
      })).then((traits) => {
        this.set('traits', traits);
        return traits;
      }),
      this.get('variants') ? Promise.all(this.get('variants').map((variant) => {
        return Promise.all(variant.modifications.traits.map((modTrait) => {
          return Trait.find(modTrait, this)
        })).then((modTraits) => {
          variant.modifications.traits = modTraits
        })
      })) : Promise.resolve(true)
    ]);
  }
  loadFaction() {
    return Faction.find(this.get('factionId').toString()).then((characterFaction) => {
      this.faction = characterFaction;
    })
  }

  matches(termSet) {
    if (!termSet) return true;
    let allowed = false;
    termSet.forEach((terms) => {
      let match = true;
      for (const key in terms) {
        let comp = this.get(key);
        match = match && comp && ( 
          comp == terms[key] ||
          (Array.isArray(comp) && (comp.includes(terms[key]) || comp.map((item) => item.id).includes(terms[key]))) ||
          (comp.id && comp.id == terms[key])
        )
      }
      allowed = allowed || match;
    })
    return allowed;
  }

  getEquipmentCostModifier(equipment) {
    let costModifier = 1;
    if (this.get('equipment_cost_modifiers')) {
      this.get('equipment_cost_modifiers').forEach((mod) => {
        if (equipment.matches(mod.match)) {
          costModifier *= mod.modifier;
        }
      })
    }
    return costModifier;
  }
}

BaseModel.initClass(Character, 'characters');

export default Character;