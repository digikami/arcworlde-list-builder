import UserDataModel from './user-data-model';
import Utils from 'utils/LoafUtils';
import Faction from './faction';
import Kingdom from './kingdom';
import Common from './common';
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
    return this.get('commanders').reduce((prev, curr) => prev + curr.totalCost(this.get('faction')) , 0) +
      this.get('members').reduce((prev, curr) => prev + curr.totalCost(this.get('faction')) , 0);
  }

  loadData() {
    return Promise.all([
      Kingdom.find(this.get('kingdom')).then((k) => {
        this.set('kingdom', k);
        return k;
      }),
      Faction.find(this.get('faction')).then((f) => {
        this.set('faction', f);
        if (this.get('subfaction')) {
          this.set('subfaction', this.get('faction').get('subfactions').find((sf) => sf.id == this.get('subfaction')))
        }
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
    d.subfaction = this.get('subfaction') ? this.get('subfaction').id : null;
    d.kingdom = typeof(this.get('kingdom')) == "string" ? this.get('kingdom') : this.get('kingdom').get('id');
    d.commanders = this.get('commanders').map((c) => c.serializeData());
    d.members = this.get('members').map((m) => m.serializeData());
    return JSON.stringify(d);
  }

  storageGroup() {
    return Warband.storageGroup;
  }

  getArmoury() {
    let armoury = this.get('faction').get('armoury').slice();
    ['commanders', 'members'].forEach((group) => {
      this.get(group).forEach((character) => {
        armoury = character.modifyArmoury(armoury);
      })
    })
    return armoury;
  }
}

Warband.storageGroup = `arcworlde_warband`;
UserDataModel.initClass(Warband);

export default Warband;