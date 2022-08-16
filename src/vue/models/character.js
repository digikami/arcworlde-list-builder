import BaseModel from './base-model';
import Equipment from './equipment';

class Character extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    data.equipment = data.equipment ?? []
    super(data);
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

BaseModel.initClass(Character, 'characters');

export default Character;