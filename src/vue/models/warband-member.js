import Equipment from './equipment';
import Character from './character';
import BaseModel from './base-model';
import Utils from 'utils/LoafUtils';
import WarbandEquipment from './warband-equipment';

class WarbandMember extends BaseModel {
  constructor(data) {
  　data.id = data.id ?? Utils.guid4();
    data.name = data.name ?? data.character.get('name');
    data.equipment = data.equipment ?? data.character.get('equipment');
    super(data)
  }

  totalCost() {
    return this.characterCost() + this.equipmentCost();
  }

  characterCost() {
    return this.get('character').get('baseCost');
  }

  equipmentCost() {
    return this.get('equipment').reduce((prev, curr) => prev + curr.totalCost(), 0);
  }

  loadData() {
    return Promise.all([
      Character.find(this.get('character')).then((c) => {
        this.set('character', c);
      }),
      Promise.all(this.get('equipment').map((e) => {
        let wbe = new WarbandEquipment(e);
        return wbe.loadData();
      })).then((eqpData) => {
        this.set('equipment', eqpData);
      })
    ]).then(() => {
      return this;
    })
  }

  serializeData() {
    let d = Utils.clone(this._data);
    d.character = this.get('character').get('id'); 
    d.equipment = this.get('equipment').map((e) => e.serializeData())
    return d;
  }
}

export default WarbandMember