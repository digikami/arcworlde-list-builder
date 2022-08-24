import BaseModel from './base-model';
import Trait from './trait'

class Equipment extends BaseModel {
  constructor(data, source) {
    data.rawId = data.id;
    data.id = `${source.id}:${data.id}`;
    super(data);
  }

  loadData() {
    let mods = this.get('modifications');
    if (mods && mods.traits) {
      return Promise.all(mods.traits.map((trait) => {
        return Trait.find(trait);
      })).then((traits) => {
        mods.traits = traits;
        this.set('modifications', mods);
        return this;
      })
    } else {
      return Promise.resolve(this);
    }
  }
}

BaseModel.initClass(Equipment, 'equipment');
Equipment.find = (id, source) => {
  let refId = typeof(id) == "string" ? id : id.id;
  if (Equipment._cache[refId]) {
    return Promise.resolve(Equipment._cache[refId]);
  }
  if (typeof(id) !== "string") {
    let inst = new Equipment(id, source);
    return inst.loadData().then(() => {
      Equipment._cache[inst.id] = inst;
      return inst;
    })
  }
  return fetch(`./data/${ slug }/${ id }.json`).then(resp => resp.json()).then(d => {
    let inst = new Equipment(d);
    return inst.loadData().then(() => {
      Equipment._cache[id] = inst;
      return inst;
    })
  })
}

export default Equipment;