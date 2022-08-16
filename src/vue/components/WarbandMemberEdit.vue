<template>
  <div class="warband-member p-3">
    <div class="d-flex justify-content-between">
      <h3 class="accordion-header" :id="`wbm_${member.get('id')}_header`">
        {{ member.get('name') }} <small class="badge bg-secondary fs-5" v-if="member.get('name') != member.get('character').get('name')">{{ member.get('character').get('name') }}</small>
      </h3>
      <div class="btn-toolbar">
        <div class="btn-group me-3">
          <div class="input-group-text">
            {{ member.totalCost() }} GP <small class="text-secondary ms-2">({{ member.characterCost() }} GP + {{ member.equipmentCost() }} GP)</small>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-secondary" :aria-label="`Edit ${ member.get('name') }`" data-bs-toggle="modal" :data-bs-target="`#wbm_${ member.get('id') }_modal`">
            <i class="bi-pencil"></i>
          </button>
          <button class="btn btn-outline-secondary" :aria-label="`Edit ${ member.get('name') }'s Equipment`" data-bs-toggle="collapse" :data-bs-target="`#wbm_${member.get('id')}_details`">
            <i class="bi-shield"></i>
          </button>
          <button class="btn btn-danger" :aria-label="`Delete ${ member.get('name') }`" @click="$emit('requestMemberRemoval', member)">
          </button>
        </div>
      </div>
    </div>

    <div class="modal fade" :id="`wbm_${ member.get('id') }_modal`" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="memberEditModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="">Edit Warband Member</h5>
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

    <div class="collapse" :id="`wbm_${member.get('id')}_details`" :aria-labelledby="`wbm_${member.get('id')}_header`">
      <div class="accordion-body">
        <div class="border-secondary border-2 border-bottom d-flex justify-content-between align-items-center py-3">
          <strong>Equipment</strong>
          <div class="btn-group">
            <multiselect
              @select="requestAddEquipment"
              :options="equipmentDropdownOptions"
              group-values="options"
              group-label="name"
              label="name"
              track-by="id"
              class="equipment-dropdown"
            ></multiselect>
          </div>
        </div>
        <ul class="list-unstyled">
          <li v-for="equipment in member.get('equipment')" class="p-2 border-1 border-bottom d-flex justify-content-between align-items-center">
            <div>{{ equipment.get('armouryItem').get('name') }}</div>
            <div class="btn-toolbar">
              <div class="btn-group me-3">
                <div class="input-group-text">
                  {{ equipment.totalCost() }} GP
                </div>
              </div>
              <div class="btn-group" v-if="!equipment.get('fixed')">
                <button class="btn btn-danger">
                  <i class="bi-x"></i>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import WarbandEquipment from '../models/warband-equipment';
  import { Modal } from 'bootstrap';

  export default {
    components: {
      Multiselect
    },
    data() {
      return {
        editFormValues: {
          name: this.member.get('name')
        }
      }
    },
    props: ['member', 'faction', 'common'],
    computed: {
      equipmentDropdownOptions() {
        return [
          {
            id: 'character',
            name: this.member.get('character').get('name'),
            options: this.member.get('character').get('armoury').map((opt) => {
              return {
                id: opt.get('id'),
                name: opt.get('name'),
                equipment: opt
              }
            })
          },
          {
            id: this.faction.get('id'),
            name: this.faction.get('name'),
            options: this.faction.get('armoury').filter((opt) => !opt.get('allow') || opt.get('allow').includes(this.member.get('character').id)).map((opt) => {
              return {
                id: opt.get('id'),
                name: opt.get('name'),
                equipment: opt
              }
            })
          },
          {
            id: 'common',
            name: 'Common',
            options: this.common.get('armoury').map((opt) => {
              return {
                id: opt.get('id'),
                name: opt.get('name'),
                equipment: opt
              }
            })
          }
        ]
      }
    },
    methods: {
      requestAddEquipment(request) {
        this.member.get('equipment').push(new WarbandEquipment({ armouryItem: request.equipment }));
      },
      saveEdits() {
        if (this.editFormValues.name == "") {
          this.editFormValues.name = this.member.get('character').get('name');
        }
        this.member.set('name', this.editFormValues.name);
        Modal.getInstance(this.$refs.memberEditModal).hide();
      }
    }
  }  
</script>