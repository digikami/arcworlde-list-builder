<template>
  <div :class="class" ref="root">
    <div class="mb-3">
      <div class="d-inline-block" aria-label="create new warband">
        <button data-bs-toggle="modal" data-bs-target="#new-list-modal" class="btn btn-outline-secondary" data-bs-title="New Warband">
          <i class="bi-plus"></i>
        </button>
      </div>
    </div>
    <div v-for="list in lists" class="list-list-item p-3">
      <template v-if="!list.isLoading">
        <div class="row">
          <div class="col-12 col-md-8 d-flex flex-column flex-md-row align-items-md-center">
            <strong class="fs-4">{{ list.get('name') }}</strong>
            <span class="mt-1 mb-3 my-md-0">
              <small class="badge bg-dark mx-md-3">{{ list.get('faction').get('name')}}<span v-if="list.get('subfaction')"> - {{ list.get('subfaction').name }}</span></small>
            </span>
          </div>
          <div class="col-12 col-md-4 text-md-end">
            <div class="btn-group me-3">
              <div class="input-group-text">
                {{ list.totalCost() }} GP
              </div>
            </div>
            <div class="btn-group" role="group">
              <button @click="closeTooltips(); $emit('requestEdit', list);" class="btn btn-outline-secondary" data-bs-title="Edit">
                <i class="bi-pencil" role="img" aria-label="Edit"></i>
              </button>
              <button @click="closeTooltips(); $emit('requestDelete', list)" class="btn btn-outline-secondary" data-bs-title="Delete">
                <i class="bi-trash" role="img" aria-label="Delete"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="modal fade" id="new-list-modal" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="newListModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="">New List</h5>
          </div>
          <div class="modal-body">
            <form class="form" @submit.prevent="requestNewList">
              <div class="my-3">
                <label for="new-list_title" class="form-label">List Name</label>
                <input type="text" id="new-list_title" class="form-control" v-model="newListForm.name"/>
              </div>
              <div class="my-3">
                <label for="new-list_faction" class="form-label">Faction</label>
                <multiselect
                  v-model="newListForm.faction"
                  :options="dropdownMap"
                  group-values="factions"
                  group-label="name"
                  label="name"
                  track-by="id"
                ></multiselect>
              </div>
              <div class="my-3" v-if="newListForm.faction && newListForm.faction.obj.get('subfactions')">
                <label for="new-list_subfaction" class="form-label">Subfaction</label>
                <multiselect
                  v-model="newListForm.subfaction"
                  :options="subfactionOptions"
                  label="name"
                  track-by="id"
                ></multiselect>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="requestNewList">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import { Modal, Tooltip } from 'bootstrap';
  import Warband from '../models/warband';
  import Utils from 'utils/LoafUtils';

  export default {
    components: {
      Multiselect
    },
    data() {
      return {
        newListForm: {
          name: null,
          faction: null,
          subfaction: null
        }
      }
    },
    computed: {
      dropdownMap() {
        let map = [];
        this.kingdoms.forEach((kingdom) => {
          map.push({
            id: kingdom.get('id'),
            name: kingdom.get('name'),
            factions: kingdom.factions.filter((faction) => faction.get('listable')).map((faction) => {
              return {
                id: faction.get('id'),
                kingdomId: kingdom.get('id'),
                name: faction.get('name'),
                obj: faction
              }
            })
          })
        })
        return map;
      },
      subfactionOptions() {
        if (this.newListForm.faction.obj.get('subfactions')) {
          return this.newListForm.faction.obj.get('subfactions');
        } else {
          return null;
        }
      }
    },
    props: ['lists', 'factions', 'kingdoms', 'class'],
    watches: ['kingdoms'],
    mounted() {
      this.assertTooltips();
    },
    updated() {
      this.assertTooltips();
    },
    methods: {
      requestNewList(evt) {
        let wbdata = Utils.clone(this.newListForm);
        wbdata.kingdom = wbdata.faction.kingdomId;
        wbdata.faction = wbdata.faction.id;
        wbdata.subfaction = wbdata.subfaction ? wbdata.subfaction.id : null;
        Warband.new(wbdata).then((wb) => {
          wb.save();
          this.lists.push(wb);
          this.closeTooltips();
          this.$emit('requestEdit', wb);
        })
        this.newListForm = {
          name: null,
          faction: null
        };
        Modal.getInstance(this.$refs.newListModal).hide();
      },
      assertTooltips() {
        this.$refs.root.querySelectorAll("[data-bs-title").forEach((tt) => {
          Tooltip.getOrCreateInstance(tt, {
            fallbackPlacements: ["top", "bottom"]
          });
        })
      },
      closeTooltips() {
        this.$refs.root.querySelectorAll("[data-bs-title").forEach((tt) => {
          Tooltip.getOrCreateInstance(tt).dispose();
        })
      }
    }
  }
</script>