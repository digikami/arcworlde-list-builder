import BaseModel from './base-model';
import Equipment from './equipment';

class Character extends BaseModel {
  constructor(data) {
    data.armoury = data.armoury ?? [];
    data.equipment = data.equipment ?? []
    data.tags = data.tags ?? [];
    data.species = data.species ?? "unknown";
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

  matches(termSet) {
    if (!termSet) return true;
    let allowed = false;
    termSet.forEach((terms) => {
      let match = true;
      for (const key in terms) {
        match = match && (this.get(key) == terms[key] || (Array.isArray(this.get(key)) && this.get(key).includes(terms[key])))
      }
      allowed = allowed || match;
    })
    return allowed;
  }
}

BaseModel.initClass(Character, 'characters');

export default Character;