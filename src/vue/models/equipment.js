import BaseModel from './base-model';

class Equipment extends BaseModel {
  constructor(data, source) {
    data.rawId = data.id;
    data.id = `${source.id}:${data.id}`;
    super(data);
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
    Equipment._cache[inst.id] = inst;
    return Promise.resolve(inst);
  }
  return fetch(`./data/${ slug }/${ id }.json`).then(resp => resp.json()).then(d => {
    let inst = new Equipment(d);
    Equipment._cache[id] = inst;
    return inst;
  })
}

export default Equipment;