import BaseModel from './base-model';

class Trait extends BaseModel {
  constructor(data, source) {
    data.id = data.id ?? data.name.toLowerCase().replace(' ', '-');
    data.rawId = data.id;
    data.id = `${source.id}:${data.id}`;
    super(data);
  }
  
}

BaseModel.initClass(Trait, 'traits');
Trait.find = (id, source) => {
  let refId = typeof(id) == "string" ? id : id.id;
  if (Trait._cache[refId]) {
    return Promise.resolve(Trait._cache[refId]);
  }
  if (typeof(id) !== "string") {
    let inst = new Trait(id, source);
    Trait._cache[inst.id] = inst;
    return Promise.resolve(inst);
  }
  return fetch(`./data/${ Trait._slug }/${ id }.json`).then(resp => resp.json()).then(d => {
    let inst = new Trait(d);
    Trait._cache[id] = inst;
    return inst;
  })
}

export default Trait;