import Equipment from "./equipment";
import BaseModel from "./base-model";
import Utils from 'utils/LoafUtils';

class WarbandEquipment extends BaseModel {
  constructor(data) {
    data.id = data.id ?? Utils.guid4();
    super(data);
  }

  totalCost() {
    return this.get('fixed') ? 0 : this.get('armouryItem').get('baseCost');
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