import UserDataModel from './user-data-model';
import Utils from 'utils/LoafUtils';
import Faction from './faction';
import Kingdom from './kingdom';
import WarbandMember from './warband-member';
import WarbandEquipment from './warband-equipment';

class Warband extends UserDataModel {
  constructor(data) {
    data.id = data.id ?? Utils.guid4();
    data.commanders = data.commanders ?? [];
    data.members = data.members ?? [];
    super(data);
  }

  totalCost() {
    return this.get('commanders').reduce((prev, curr) => prev + curr.totalCost() , 0) +
      this.get('members').reduce((prev, curr) => prev + curr.totalCost() , 0);
  }

  loadData() {
    return Promise.all([
      Kingdom.find(this.get('kingdom')).then((k) => {
        this.set('kingdom', k);
        return k;
      }),
      Faction.find(this.get('faction')).then((f) => {
        this.set('faction', f);
        return f;
      }),
      Promise.all(this.get('commanders').map((c) => {
        let commander = new WarbandMember(c);
        return commander.loadData()
      })).then((commanders) => {
        this.set('commanders', commanders);
        return commanders;
      }),
      Promise.all(this.get('members').map((m) => {
        let member = new WarbandMember(m);
        return member.loadData()
      })).then((members) => {
        this.set('members', members);
        return members;
      }),
    ]).then(() => {
      return this;
    });
  }

  serializeData() {
    let d = Utils.clone(this._data);
    d.faction = typeof(this.get('faction')) == "string" ? this.get('faction') : this.get('faction').get('id');
    d.kingdom = typeof(this.get('kingdom') == "string" ? this.get('kingdom') : this.get('kingdom').get('id'));
    d.commanders = this.get('commanders').map((c) => c.serializeData());
    d.members = this.get('members').map((m) => m.serializeData());
    return JSON.stringify(d);
  }

  storageGroup() {
    return `arcworlde_warband`;
  }
}

Warband._cache = [];
Warband.find = (id) => {
  if (typeof(id) !== "string") {
    return Warband.find(id.id);
  }
  if (Warband._cache[id]) {
    return Promise.resolve(Warband._cache[id]);
  }
  let wbData = JSON.parse(window.localStorage.getItem(`arcworlde_warband_${id}`));
  return Warband.new(wbData).then((wb) => {
    Warband._cache[id] = wb;
    return wb;
  })
}
Warband.all = () => {
  return Promise.all(JSON.parse(window.localStorage.getItem('arcworlde_warband_index') ?? '[]').map(list => {
    return Warband.find(list);
  }));
}
Warband.new = (data) => {
  let wb = new Warband(data);
  return wb.loadData();
}

export default Warband;