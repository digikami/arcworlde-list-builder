<template>
  <div class="list-editor">
    <div class="container  p-3 border-bottom border-dark border-2 sticky-top bg-white">
      <div class="d-flex justify-content-between align-items-center">
        <h1>{{ list.get('name') }}</h1>
        <div class="btn-toolbar">
          <div class="btn-group me-3">
            <div class="input-group-text">
              {{ list.totalCost() }} GP
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-success" @click="handleSaveRequest">
              <i class="bi-save"></i>
            </button>
            <button class="btn btn-danger" @click="handleDeleteRequest">
              <i class="bi-trash"></i>
            </button>
            <button class="btn btn-outline-secondary" @click="$emit('close')">
              <i class="bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container py-3">
      <div class="border-secondary border-2 border-bottom d-flex justify-content-between align-items-center py-3">
        <h2 class="m-0">Commander</h2>
        <div class="dropstart" v-if="list.get('commanders').length < list.get('faction').get('commanderLimit')">
          <button :class="`btn btn-success`" aria-label="Add Commander" data-bs-toggle="dropdown">
            <i class="bi-plus"></i>
          </button>
          <ul class="dropdown-menu">
            <li v-for="character in factionCommanders">
              <button @click="requestNewCommander(character)" class="dropdown-item">
                {{ character.get("name") }}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="container py-3 px-0">
        <div class="d-flex flex-column gap-3">
          <WBMEditor v-for="character in list.get('commanders')" :member="character" :faction="list.get('faction')" :common="common" @requestMemberRemoval="handleCommanderRemoval"></WBMEditor>
        </div>
      </div>

      <div class="border-secondary border-2 border-bottom d-flex justify-content-between align-items-center py-3">
        <h2 class="m-0">Warband</h2>
        <div>
          <multiselect
            @select="requestNewMember"
            :options="memberOptions"
            group-values="members"
            group-label="name"
            label="name"
            track-by="id"
            class="equipment-dropdown"
          ></multiselect>
        </div>
      </div>
      <div class="container py-3 px-0">
        <div class="d-flex flex-column gap-3">
          <WBMEditor v-for="character in list.get('members')" :member="character" :faction="list.get('faction')" :common="common" @requestMemberRemoval="handleMemberRemoval"></WBMEditor>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import WarbandMember from '../models/warband-member';
  import WBMEditor from './WarbandMemberEdit.vue';

  export default {
    data: () => {
      return {

      }
    },
    components: {
      'WBMEditor': WBMEditor,
      Multiselect
    },
    computed: {
      factionCommanders() {
        return this.list.get('faction').get('characters').filter((a) => a.get("class").map((a) => a.toLowerCase()).includes("commander"))
      },
      memberOptions() {
        let opts = [];
        opts.push({
          id: this.list.get('faction').id,
          name: this.list.get('faction').get('name'),
          members: this.list.get('faction').get('characters').filter((a) => {
            return !(a.get("class").map((a) => a.toLowerCase()).includes("commander") && a.get('class').length == 1);
          }).map((character) => {
            return {
              id: character.id,
              name: character.get('name'),
              character: character
            };
          })
        })
        let listKingdom = this.kingdoms.find((kingdom) => kingdom.get('factions').filter((faction) => faction.id == this.list.get('faction').id).length > 0);
        opts = opts.concat(listKingdom.get('factions').filter((faction) => faction.id != this.list.get('faction').id).map((faction) => {
          return {
            id: faction.id,
            name: faction.get('name'),
            members: faction.get('characters').filter((a) => {
              return !(a.get("class").map((a) => a.toLowerCase()).includes("commander") && a.get('class').length == 1);
            }).map((character) => {
              return {
                id: character.id,
                name: character.get('name'),
                character: character
              };
            })
          }
        }))
        return opts;
      },
      factionMembers() {
        return this.list.get('faction').get('characters').filter((a) => {
          return !(a.get("class").map((a) => a.toLowerCase()).includes("commander") && a.get('class').length == 1)
        })
      },
      kingdomMembers() {
        let listKingdom = this.kingdoms.find((kingdom) => kingdom.get('factions').filter((faction) => faction.id == this.list.get('faction').id).length > 0);
        return listKingdom.get('factions').filter((faction) => faction.id != this.list.get('faction').id).map((faction) => {
          return {
            id: faction.id,
            name: faction.get('name'),
            members: faction.get('characters').filter()
          }
        })
      }
    },
    props: ["list", "kingdoms", "common"],
    methods: {
      handleSaveRequest() {
        this.list.save();
      },
      requestNewCommander(character) {
        if (this.list.get('commanders').length >= this.list.get('faction').get('commanderLimit'))
          return;
        let wbm = new WarbandMember({ character: character, equipment: [] });
        wbm.loadData().then((m) => {
          console.log(m);
          this.list.get('commanders').push(m);
        })
      },
      requestNewMember(selection) {
        let wbm = new WarbandMember({ character: selection.character, equipment: [] });
        wbm.loadData().then((m) => {
          this.list.get('members').push(m);
        })
      },
      handleCommanderRemoval(member) {
        this.list.get('commanders').splice(this.list.get('commanders').indexOf(member), 1);
      },
      handleMemberRemoval(member) {
        this.list.get('members').splice(this.list.get('members').indexOf(member), 1);
      }
    }
  }
</script>