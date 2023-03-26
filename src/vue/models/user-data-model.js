import BaseModel from './base-model';

class UserDataModel extends BaseModel {
  constructor(data) {
    super(data);
  }

  // override in subclass
  loadData() {
    return Promise.resolve(this)
  }

  serializeData(stripIds = false) {
    let d = JSON.stringify(this._data);
    if (stripIds) {
      d.id = null;
    }
    return d
  }

  storageSlug() {
    return `${this.constructor._storageGroup}_${ this.id }`;
  }

  getIndex() {
    if (!window.localStorage.getItem(this.constructor.storageIndex())) {
      window.localStorage.setItem(this.constructor.storageIndex(), JSON.stringify([]));
    }
    let index = JSON.parse(window.localStorage.getItem(this.constructor.storageIndex()));
    return index;
  }

  save() {
    window.localStorage.setItem(this.storageSlug(), this.serializeData());
    let index = this.getIndex();
    if (!index.includes(this.id)) {
      index.push(this.id);
      this.constructor.saveIndex(index);
    }
  }

  destroy() {
    window.localStorage.removeItem(this.storageSlug());
    let index = this.getIndex();
    index.splice(index.indexOf(this.id), 1);
    window.localStorage.setItem(this.constructor.storageIndex(), JSON.stringify(index));

  }
  delete() {
    this.destroy();
  }

  reset() {
    this.isLoading = true;
    delete this.constructor._cache[this.id];
    let d = JSON.parse(window.localStorage.getItem(this.storageSlug()));
    this._data = d;
    return this.loadData().then(() => {
      this.isLoading = false;
      this.constructor._cache[this.id] = this;
      return this;
    })
  }
}

UserDataModel.initClass = (cls, storageGroup) => {
  cls._cache = {};
  cls._storageGroup = storageGroup;
  cls.find = (id) => {
    if (typeof(id) !== "string") {
      return cls.find(id.id);
    }
    if (cls._cache[id]) {
      return Promise.resolve(cls._cache[id]);
    }
    let wbData = JSON.parse(window.localStorage.getItem(`${cls._storageGroup}_${id}`));
    return cls.new(wbData).then((wb) => {
      cls._cache[id] = wb;
      return wb;
    })
  }
  cls.all = () => {
    return Promise.all(JSON.parse(window.localStorage.getItem(cls.storageIndex()) ?? '[]').map(list => {
      return cls.find(list);
    }));
  }
  cls.new = (data) => {
    let wb = new cls(data);
    wb.isLoading = true;
    return wb.loadData().then(() => {
      wb.isLoading = false;
      return wb;
    });
  }
  cls.storageIndex = () => {
    return `${ cls._storageGroup }_index`;
  }
  cls.saveIndex = (index) => {
    window.localStorage.setItem(cls.storageIndex(), JSON.stringify(index));
    return index;
  }
}

export default UserDataModel;