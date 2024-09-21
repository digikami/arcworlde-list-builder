import Equipment from './equipment';
import Character from './character';
import Trait from './trait';
import BaseModel from './base-model';
import Utils from 'utils/LoafUtils';
import WarbandEquipment from './warband-equipment';

class WarbandMember extends BaseModel {
  constructor(data) {
    data.id = data.id ?? Utils.guid4();
    data.name = data.name ?? data.character.get('name');
    data.equipment = data.equipment ?? Utils.clone(data.character.get('equipment'));
    super(data)
  }

  getVariantData() {
    if (this.get('variant')) {
      return this.get('character').get('variants').find((variant) => variant.id == this.get('variant'));
    } else {
      return null;
    }
  }

  equipmentCost(faction) {
    return this.get('equipment').reduce((prev, curr) => prev + curr.totalCost(faction, this), 0);
  }

  loadData() {
    return Promise.all([
      Character.find(this.get('character')).then((c) => {
        this.set('character', c);
        if (c.hasVariants() && !this.get('variant')) {
          this.set('variant', c.get('variants')[0].id);
        }
      }, (error) => {
        let charId = this.get('character');
        this.set('character', new Character({}));
        this.set('name', `Could not find character with ID ${ charId }`);
      }).then(() => {
        this.get('character').get('equipment').forEach((fixedEquip) => {
          if (this.get('equipment').filter((eqpJson) => {
            return eqpJson.fixed && eqpJson.armouryItem == fixedEquip.armouryItem
          }).length == 0) {
            this.get('equipment').unshift(fixedEquip);
          }
        })
        return Promise.all(this.get('equipment').map((e) => {
          let wbe = new WarbandEquipment(e);
          return wbe.loadData();
        })).then((eqpData) => {
          this.set('equipment', eqpData);
        })
      })
    ]).then(() => {
      return this;
    })
  }

  getStats() {
    let stats = {
      ap: this.get('character').get('ap'),
      move: this.get('character').get('move'),
      bravery: this.get('character').get('bravery'),
      hp: this.get('character').get('hp')
    };
    this.get('equipment').forEach((equipment) => {
      stats = equipment.modifyStats(stats);
    })
    return stats;
  }

  getAttacks() {
    let attacks = Utils.clone(this.get('character').getVariant('attacks', this.get('variant')));
    this.get('equipment').forEach((equipment) => {
      attacks = equipment.modifyAttacks(attacks);
    })
    this.get('equipment').forEach((equipment) => {
      attacks = equipment.modifyAttackPower(attacks);
    })
    return attacks;
  }

  getTraits() {
    let traits = this.get('character').getVariant('traits', this.get('variant'));
    this.get('equipment').forEach((equipment) => {
      traits = equipment.modifyTraits(traits);
    })
    return traits;
  }

  getBaseSize() {
    let baseSize = this.get('character').get('baseSize');
    this.get('equipment').forEach((equipment) => {
      baseSize = equipment.modifyBaseSize(baseSize);
    })
    return baseSize;
  }

  serializeData(stripIds = false) {
    let d = Utils.clone(this._data);
    d.character = this.get('character').get('id');
    d.equipment = this.get('equipment').map((e) => e.serializeData(stripIds))
    if (stripIds) {
      d.id = null;
    }
    return d;
  }

  modifyArmoury(armoury) {
    return armoury.concat(this.get('character').get('armoury'));
  }

  modifyCharacterCost(character, cost) {
    if (this.get('character').getVariant('cost_modifiers', this.get('variant'))) {
      this.get('character').getVariant('cost_modifiers', this.get('variant')).forEach((mod) => {
        if (character.matches(mod.match)) {
          cost *= mod.modifier;
        }
      })
    }

    return Math.ceil(cost);
  }

  modifyEquipmentCost(equipment, member, cost) {

    return cost;
  }

  isAllowedEquipment(equip) {
    return this.get('character').matches(equip.get('allow'));
  }

  clone() {
    let d = this.serializeData(true);
    let clone = new WarbandMember(d);
    return clone.loadData();
  }
}

export default WarbandMember