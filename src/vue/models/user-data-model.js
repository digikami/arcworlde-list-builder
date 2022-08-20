import BaseModel from './base-model';

class UserDataModel extends BaseModel {
  constructor(data) {
    super(data);
  }

  // override in subclass
  loadData() {
    return Promise.resolve(this)
  }

  serializeData() {
    return JSON.stringify(this._data);
  }

  storageSlug() {
    return `${this.storageGroup()}_${ this.id }`;
  }

  storageIndex() {
    return `${ this.storageGroup() }_index`;
  }

  getIndex() {
    if (!window.localStorage.getItem(this.storageIndex())) {
      window.localStorage.setItem(this.storageIndex(), JSON.stringify([]));
    }
    let index = JSON.parse(window.localStorage.getItem(this.storageIndex()));
    return index;
  }

  save() {
    window.localStorage.setItem(this.storageSlug(), this.serializeData());
    let index = this.getIndex();
    if (!index.includes(this.id)) {
      index.push(this.id);
      window.localStorage.setItem(this.storageIndex(), JSON.stringify(index));
    }
  }

  destroy() {
    window.localStorage.removeItem(this.storageSlug());
    let index = this.getIndex();
    index.splice(index.indexOf(this.id), 1);
    window.localStorage.setItem(this.storageIndex(), JSON.stringify(index));

  }
  delete() {
    this.destroy();
  }

  reset() {
    this.isLoading = true;
    delete this.constructor._cache[this.id];
    let d = JSON.parse(window.localStorage.getItem(`${this.constructor.storageGroup}_${this.id}`));
    this._data = d;
    return this.loadData().then(() => {
      this.isLoading = false;
      this.constructor._cache[this.id] = this;
      return this;
    })
  }
}

UserDataModel.initClass = (cls) => {
  cls._cache = {};
  cls.find = (id) => {
    if (typeof(id) !== "string") {
      return cls.find(id.id);
    }
    if (cls._cache[id]) {
      return Promise.resolve(cls._cache[id]);
    }
    let wbData = JSON.parse(window.localStorage.getItem(`${cls.storageGroup}_${id}`));
    return cls.new(wbData).then((wb) => {
      cls._cache[id] = wb;
      return wb;
    })
  }
  cls.all = () => {
    return Promise.all(JSON.parse(window.localStorage.getItem(`${cls.storageGroup}_index`) ?? '[]').map(list => {
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
}

export default UserDataModel;