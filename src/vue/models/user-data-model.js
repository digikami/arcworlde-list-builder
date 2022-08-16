import BaseModel from './base-model';

class UserDataModel extends BaseModel {
  constructor(data) {
    super(data);
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
}

export default UserDataModel;