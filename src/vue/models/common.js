import BaseModel from './base-model';
import Equipment from './equipment';
import Trait from './trait';

class Common extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    super(data)
  }

  loadData() {
    return Promise.all([this.loadArmoury(), this.loadTraits()]);
  }

  loadArmoury() {
    return Promise.all(this.get('armoury').map((armouryItem) => {
      return Equipment.find(armouryItem, this);
    })).then((armoury) => {
      this.set('armoury', armoury);
      return armoury;
    });
  }

  loadTraits() {
    return Promise.all(this.get('traits').map((trait) => {
      return Trait.find(trait, this);
    })).then((traits) => {
      this.set('traits', traits);
      return traits;
    })
  }
}

Common.find = () => {
  return fetch('./data/common.json').then(resp => resp.json()).then(data => {
    return new Common(data);
  })
}

Common.all = Common.find;

export default Common;