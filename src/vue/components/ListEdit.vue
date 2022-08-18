<template>
  <div class="list-editor" ref="root">
    <div class="container">
      <a @click="$emit('close')" class="btn btn-dark"><i class="bi-arrow-left-short"></i> Back</a>
    </div>
    <div class="container  p-3 border-bottom border-dark border-2 sticky-top bg-white">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <h1>{{ list.get('name') }}</h1>
          <small class="badge bg-dark mx-3">{{ list.get('faction').get('name')}}<span v-if="list.get('subfaction')"> - {{ list.get('subfaction').name }}</span></small>
        </div>

        <div class="btn-toolbar">
          <div class="btn-group me-3">
            <div class="input-group-text">
              {{ list.totalCost() }} GP
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" aria-label="Edit Warband Data" data-bs-toggle="modal" :data-bs-target="`#wbm_${ list.get('id') }_modal`">
              <div data-bs-toggle="tooltip" data-bs-title="Edit">
                <i class="bi-pencil"></i>
              </div>
            </button>

            <button class="btn btn-outline-secondary" aria-label="Save Changes" @click="handleSaveRequest">
              <div data-bs-toggle="tooltip" data-bs-title="Save">
                <i class="bi-save"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container py-3">
      <div class="d-flex justify-content-between align-items-center p-3 bg-tertiary text-white">
        <h2 class="m-0">Commander</h2>
        <div class="dropstart" v-if="list.get('commanders').length < list.get('faction').get('commanderLimit')">
          <button :class="`btn btn-light`" aria-label="Add Commander" data-bs-toggle="dropdown">
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
          <WBMEditor v-for="character in list.get('commanders')" :member="character" :faction="list.get('faction')" :common="common" :list="list" @requestMemberRemoval="handleCommanderRemoval"></WBMEditor>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center p-3 bg-tertiary text-white">
        <h2 class="m-0 mb-3 mb-md-0">Warband</h2>
        <div>
          <multiselect
            @select="requestNewMember"
            :options="memberOptions"
            openDirection="bottom"
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
          <WBMEditor v-for="character in list.get('members')" :member="character" :faction="list.get('faction')" :common="common" :list="list" @requestMemberRemoval="handleMemberRemoval"></WBMEditor>
        </div>
      </div>
    </div>

    <div class="modal fade" :id="`wbm_${ list.get('id') }_modal`" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="listEditModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="">Edit Warband</h5>
          </div>
          <div class="modal-body">
            <form class="form" @submit.prevent="saveEdits">
              <div class="my-3">
                <label for="new-list_title" class="form-label">Name</label>
                <input type="text" id="wbm_title" class="form-control" v-model="editFormValues.name"/>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEdits">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import WarbandMember from '../models/warband-member';
  import WBMEditor from './WarbandMemberEdit.vue';
  import { Modal, Tooltip } from 'bootstrap';

  export default {
    data() {
      return {
        editFormValues: {
          name: this.list.get('name')
        }
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
          }).sort((a, b) => a.name == b.name ? 0 : (a.name < b.name ? -1 : 1 ))
        });
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
            }).sort((a, b) => a.name == b.name ? 0 : (a.name < b.name ? -1 : 1 ))
          }
        }));
        ["swords-for-hire", "bestiary"].forEach((kingdomId) => {
          let commonKingdom = this.kingdoms.find((kingdom) => kingdom.id == kingdomId);
          opts = opts.concat(commonKingdom.get('factions').filter((faction) => faction.id != this.list.get('faction').id).map((faction) => {
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
              }).sort((a, b) => a.name == b.name ? 0 : (a.name < b.name ? -1 : 1 ))
            }
          }))
        })
        return opts;
      }
    },
    props: ["list", "kingdoms", "common"],
    mounted() {
      this.$refs.root.querySelectorAll("[data-bs-toggle='tooltip']").forEach((tt) => {
        Tooltip.getOrCreateInstance(tt, {
          fallbackPlacements: ["top", "bottom"]
        });
      })
    },
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
      },
      saveEdits() {
        this.list.set('name', this.editFormValues.name);
        Modal.getInstance(this.$refs.listEditModal).hide();
      }
    }
  }
</script>