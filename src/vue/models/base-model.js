import Utils from 'utils/LoafUtils';

class BaseModel {
  constructor(data) {
    this.id = data.id;
    this._data = data;
  }

  loadData() {
    return Promise.resolve(this);
  }

  get(key) {
    return this._data[key];
  }

  set(key, val) {
    this._data[key] = val;
    return this;
  }

  hasVariants() {
    return !!this.get('variants');
  }

  hasVariant(varId) {
    return this.hasVariants() && !!this.get('variants').filter((v) => v.id == varId).length;
  }

  getVariant(key, variantId) {
    if (this.hasVariant(variantId)) {
      let merged = Utils.addativeMerge(this._data, this.get('variants').find((v) => v.id == variantId).modifications ?? {})
      return merged[key];
    } else {
      return this.get(key);
    }
  }

  toJSON() {
    return JSON.stringify(this._data);
  }
}

BaseModel.getAppVersion = () => {
  return window.alb?.version ?? Math.round(Math.random() * 1000000);
}
BaseModel.initClass = (cls, slug) => {
  cls._cache = {};
  cls._slug = slug;

  cls.find = (id) => {
    let refId = typeof(id) == "string" ? id : id.id;
    if (cls._cache[refId]) {
      return Promise.resolve(cls._cache[refId]);
    }
    if (typeof(id) !== "string") {
      let inst = new cls(id);
      cls._cache[inst.id] = inst;
      return inst.loadData().then(() => inst);
    }
    return fetch(`./data/${ cls._slug }/${ id }.json?v=${BaseModel.getAppVersion()}`).then(resp => resp.json()).then(d => {
      let inst = new cls(d);
      cls._cache[id] = inst;
      return inst.loadData().then(() => inst);
    })
  }

  cls.fetch = cls.find;

  cls.all = () => {
    return fetch(`./data/${ cls._slug }/_index.json?v=${BaseModel.getAppVersion()}`).then(resp => resp.json()).then(kids => {
      return Promise.all(kids.map((kid) => cls.find(kid)))
    })
  }
}

export default BaseModel;