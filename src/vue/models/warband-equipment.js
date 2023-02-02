import Equipment from "./equipment";
import Trait from './trait';
import BaseModel from "./base-model";
import Utils from 'utils/LoafUtils';

class WarbandEquipment extends BaseModel {
  constructor(data) {
    data.id = data.id ?? Utils.guid4();
    super(data);
  }

  getVariantData() {
    if (this.get('variant')) {
      return this.get('character').get('variants').find((variant) => variant.id == this.get('variant'));
    } else {
      return null;
    }
  }

  name() {
    return this.get('armouryItem').get('name')
  }
  description() {
    return this.get('armouryItem').get('description')
  }

  totalCost() {
    return this.get('fixed') ? 0 : this.get('armouryItem').get('baseCost');
  }

  modifyStats(stats) {
    let mods = this.get('armouryItem').get('modifications');
    if (mods) {
      stats.hp += mods.hp ? mods.hp : 0;
      stats.move += mods.move ? mods.move : 0;
      stats.bravery += mods.bravery ? mods.bravery : 0;
      stats.ap += mods.ap ? mods.ap : 0;
    }
    return stats;
  }

  modifyAttacks(attacks) {
    let mods = this.get('armouryItem').get('modifications');
    if (mods && mods.attacks) {
      attacks = attacks.concat(Utils.clone(mods.attacks));
    }
    return attacks;
  }

  modifyAttackPower(attacks) {
    let mods = this.get('armouryItem').get('modifications');
    if (mods && mods.power) {
      let powerMod = Utils.clone(mods.power);
      attacks.forEach((attack) => {
        if (attack.type && attack.type in powerMod) {
          attack.power += powerMod[attack.type];
        }
      })
    }
    return attacks;
  }

  modifyTraits(traits) {
    let mods = this.get('armouryItem').get('modifications');
    if (mods && mods.traits) {
      traits = traits.concat(mods.traits);
    }
    return traits;
  }

  loadData() {
    return Promise.all([
      Equipment.find(this.get('armouryItem')).then((eq) => this.set('armouryItem', eq))
    ]).then(() => {
      return this;
    })
  }

  serializeData() {
    let d = Utils.clone(this._data);
    d.armouryItem = this.get('armouryItem').get('id');
    return d;
  }
}

export default WarbandEquipment;