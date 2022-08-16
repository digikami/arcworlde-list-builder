import BaseModel from './base-model';
import Equipment from './equipment';

class Common extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    super(data)
  }

  loadArmoury() {
    return Promise.all(this.get('armoury').map((armouryItem) => {
      return Equipment.find(armouryItem, this);
    })).then((armoury) => {
      this.set('armoury', armoury);
      return armoury;
    });
  }
}

Common.find = () => {
  return fetch('./data/common.json').then(resp => resp.json()).then(data => {
    return new Common(data);
  })
}

Common.all = Common.find;

export default Common;