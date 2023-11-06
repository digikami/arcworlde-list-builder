<template>
  <div class="list-editor" ref="root">
    <div class="container">
      <a @click="isDirty ? null : $emit('close')" class="btn btn-dark" :data-bs-toggle="isDirty ? 'modal': null" data-bs-target="#wbm_dirty_modal"><i class="bi-arrow-left-short"></i> Back</a>
    </div>
    <div class="container  p-3 border-bottom border-dark border-2 sticky-top bg-white">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div class="d-flex flex-column flex-md-row align-items-md-center gap-1">
          <h1>{{ list.get('name') }}</h1>
          <small class="badge bg-dark">
            {{ list.get('faction').get('name')}}
            <span v-if="list.get('subfaction')"> - {{ list.get('subfaction').name }}</span>
            <span v-if="list.get('faction').get('version')">({{ list.get('faction').get('version') }})</span>
          </small>
        </div>

        <div class="btn-toolbar">
          <div class="btn-group me-3">
            <div class="input-group-text">
              {{ list.totalCost() }} GP
            </div>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" aria-label="Warband Print View" @click="$emit('requestView', list)" data-bs-title="Print">
              <i class="bi-eye"></i>
            </button>

            <button class="btn btn-outline-secondary" aria-label="Edit Warband Data" data-bs-toggle="modal" :data-bs-target="`#wbm_${ list.get('id') }_modal`" data-bs-title="Edit">
              <i class="bi-pencil"></i>
            </button>

            <button :class="`btn ${ isDirty ? 'btn-dark' : 'btn-outline-secondary' }`" aria-label="Save Changes" @click="handleSaveRequest" data-bs-title="Save">
              <i :class="isDirty ? 'bi-save' : 'bi-check-circle'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="container py-3">
      <div class="d-flex justify-content-between align-items-center p-3 bg-tertiary text-white">
        <h2 class="m-0">Commander</h2>
        <div class="dropstart" ref="commanderDropdown" v-if="list.get('commanders').length < list.get('faction').get('commanderLimit')">
          <button class="btn btn-light" ref="commanderDropdownToggle" aria-label="Add Commander" data-bs-toggle="dropdown">
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
        <draggable v-model="listCommanders" :disabled="listCommanders.length <= 1" @start="drag.commanders=true" @end="drag.commanders=false; handleDirty()" item-key="id" handle=".handle">
          <template #item="{element}">
            <WBMEditor
              :member="element"
              :faction="list.get('faction')"
              :common="common"
              :list="list"
              :draggable="listCommanders.length > 1"
              @requestMemberRemoval="handleCommanderRemoval"
              @dirty="handleDirty"
            ></WBMEditor>
          </template>
        </draggable>
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
        <draggable v-model="listMembers" :disabled="listMembers.length <= 1" @start="drag.members=true" @end="drag.members=false; handleDirty()" item-key="id" handle=".handle">
          <template #item="{element}">
            <WBMEditor
              :member="element"
              :faction="listFaction"
              :common="common"
              :list="list"
              :duplicable="true"
              :draggable="listMembers.length > 1"
              @requestMemberRemoval="handleMemberRemoval"
              @requestDuplicate="handleDuplicateRequest"
              @dirty="handleDirty"
            ></WBMEditor>
          </template>
        </draggable>
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

    <div class="modal fade" :id="`wbm_dirty_modal`" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="listDirtyModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="">There are unsaved changes.</h5>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="$emit('close')">Close Without Saving</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="handleSaveRequest(); $emit('close');">Save and Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import WarbandMember from '../models/warband-member';
  import WarbandEquipment from '../models/warband-equipment';
  import WBMEditor from './WarbandMemberEdit.vue';
  import { Modal, Tooltip, Dropdown } from 'bootstrap';
  import draggable from 'vuedraggable';

  export default {
    data() {
      return {
        drag: {
          commanders: false,
          members: false
        },
        editFormValues: {
          name: this.list.get('name')
        },
        isDirty: false
      }
    },
    components: {
      'WBMEditor': WBMEditor,
      Multiselect,
      draggable
    },
    computed: {
      listMembers: {
        get() {
          return this.list.get('members');
        },
        set(val) {
          this.list.set('members', val);
        }
      },
      listCommanders: {
        get() {
          return this.list.get('commanders');
        },
        set(val) {
          this.list.set('commanders', val);
        }
      },
      listFaction: {
        get() {
          return this.list.get('faction');
        },
        set(val) {
          return this.list.set('faction', val);
        }
      },
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
              }).filter((character) => {
                return !(character.matches([{ traits: 'swords-for-hire:personality'}]) && this.list.get('members').find((member) => member.get('character').get('id') == character.get('id')));
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
      this.$refs.root.querySelectorAll("[data-bs-title]").forEach((tt) => {
        Tooltip.getOrCreateInstance(tt, {
          fallbackPlacements: ["top", "bottom"]
        });
      })
    },
    methods: {
      handleSaveRequest() {
        this.list.save();
        this.isDirty = false;
      },
      requestNewCommander(character) {
        if (this.list.get('commanders').length >= this.list.get('faction').get('commanderLimit')) {
          return;
        }
        let wbm = new WarbandMember({ character: character, equipment: [] });
        wbm.loadData().then((m) => {
          Dropdown.getInstance(this.$refs.commanderDropdownToggle).hide();
          this.list.get('commanders').push(m);
          this.handleDirty();
        })
      },
      requestNewMember(selection, equipment = []) {
        let wbm = new WarbandMember({ character: selection.character, equipment: equipment });
        wbm.loadData().then((m) => {
          this.list.get('members').push(m);
          this.handleDirty();
        })
      },
      handleCommanderRemoval(member) {
        this.list.get('commanders').splice(this.list.get('commanders').indexOf(member), 1);
        this.handleDirty();
      },
      handleMemberRemoval(member) {
        this.list.get('members').splice(this.list.get('members').indexOf(member), 1);
        this.handleDirty();
      },
      saveEdits() {
        this.list.set('name', this.editFormValues.name);
        Modal.getInstance(this.$refs.listEditModal).hide();
        this.handleDirty();
      },
      handleDuplicateRequest(member) {
        member.clone().then((clone) => {
          this.list.get('members').push(clone);
          this.handleDirty();
        })
      },
      handleDirty() {
        this.isDirty = true;
      }
    }
  }
</script>