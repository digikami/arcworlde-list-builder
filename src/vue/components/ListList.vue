<template>
  <div :class="class">
    <div class="">
      <button data-bs-toggle="modal" data-bs-target="#new-list-modal" class="btn btn-success">
        <i class="bi-patch-plus-fill"></i>
      </button>
    </div>
    <div v-for="list in lists">
      <div class="row my-3">
        <div class="col-12 col-md-8">
          {{ list.get('name') }}
          <small class="text-dark">&lt;{{ list.get('faction').id}}&gt;</small>
        </div>
        <div class="col-12 col-md-4 text-center">
          <div class="btn-group" role="group">
            <button @click="$emit('requestEdit', list)" class="btn btn-primary">
              <i class="bi-pencil" role="img" aria-label="Edit"></i> Edit
            </button>
            <button @click="$emit('requestDelete', list)" class="btn btn-outline-danger">
              <i class="bi-trash-fill" role="img" aria-label="Delete"></i> Delete
            </button>
          </div>
        </div>
      </div>
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
  import { Modal } from 'bootstrap';
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
          faction: null
        }
      }
    },
    computed: {
      playableFactions() {
        return this.factions.filter((a) => a.listable);
      },
      dropdownMap() {
        let map = [];
        this.kingdoms.forEach((kingdom) => {
          map.push({
            id: kingdom.get('id'),
            name: kingdom.get('name'),
            factions: kingdom.factions.map((faction) => {
              return {
                id: faction.get('id'),
                kingdomId: kingdom.get('id'),
                name: faction.get('name')
              }
            })
          })
        })
        return map;
      }
    },
    props: ['lists', 'factions', 'kingdoms', 'class'],
    watches: ['kingdoms'],
    mounted() {
      console.log(this.lists);
    },
    methods: {
      requestNewList(evt) {
        let wbdata = Utils.clone(this.newListForm);
        wbdata.faction = wbdata.faction.id;
        wbdata.kingdom = wbdata.faction.kingdomId;
        Warband.new(wbdata).then((wb) => {
          wb.save();
          this.lists.push(wb);
        })
        this.newListForm = {
          name: null,
          faction: null
        };
        Modal.getInstance(this.$refs.newListModal).hide();
      }
    }
  }
</script>