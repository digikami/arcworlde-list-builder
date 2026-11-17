import BaseModel from './base-model';
import Trait from './trait'

class Equipment extends BaseModel {
  constructor(data, source) {
    data.rawId = data.id;
    data.id = `${source.id}:${data.id}`;
    data.source = source.id;
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

  matches(termSet) {
    if (!termSet) return true;
    let allowed = false;
    termSet.forEach((terms) => {
      let match = true;
      for (const key in terms) {
        let comp = this.get(key);
        if (!comp) {
          match = false;
          continue;
        }
        let val = terms[key].startsWith('!') ? terms[key].substring(1) : terms[key];
        let not = terms[key].startsWith('!');
        let keyMatch = (
          comp == val ||
          (Array.isArray(comp) && (comp.includes(val) || comp.map((item) => item.id).includes(val))) ||
          (comp.id && comp.id == val)
        );
        if (not) keyMatch = !keyMatch
        match = match && keyMatch;
      }
      allowed = allowed || match;
    })
    return allowed;
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