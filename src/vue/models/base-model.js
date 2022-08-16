class BaseModel {
  constructor(data) {
    this.id = data.id;
    this._data = data;
  }

  get(key) {
    return this._data[key];
  }

  set(key, val) {
    this._data[key] = val;
    return this;
  }
}

BaseModel.initClass = (cls, slug) => {
  cls._cache = {};

  cls.find = (id) => {
    let refId = typeof(id) == "string" ? id : id.id;
    if (cls._cache[refId]) {
      return Promise.resolve(cls._cache[refId]);
    }
    if (typeof(id) !== "string") {
      let inst = new cls(id);
      cls._cache[inst.id] = inst;
      return Promise.resolve(inst);
    }
    return fetch(`./data/${ slug }/${ id }.json`).then(resp => resp.json()).then(d => {
      let inst = new cls(d);
      cls._cache[id] = inst;
      return inst;
    })
  }

  cls.fetch = cls.find;

  cls.all = () => {
    return fetch(`./data/${ slug }/_index.json`).then(resp => resp.json()).then(kids => {
      return Promise.all(kids.map((kid) => cls.find(kid)))
    })
  }
}

export default BaseModel;