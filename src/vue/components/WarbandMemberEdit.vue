<template>
  <div class="warband-member px-3 py-4" ref="root">
    <div class="d-flex flex-column flex-md-row justify-content-md-between gap-3">
      <strong :class="`accordion-header d-lg-flex flex-lg-row align-items-lg-center gap-2 fs-3 ${ member.get('character').get('name') == null ? 'text-danger' : ''}`" :id="`wbm_${member.get('id')}_header`">
        <i :class="`bi-grip-vertical handle ${ draggable ? '': 'opacity-0' }`"></i>
        {{ member.get('name') }} <small class="badge bg-secondary fs-6" v-if="member.get('name') != member.get('character').get('name')">{{ member.get('character').get('name') }}</small>
      </strong>
      <div class="d-flex gap-2 flex-shrink-0 align-items-center">
        <div class="btn-toolbar">
          <div class="btn-group">
            <div ref="memberCost" class="input-group-text" data-bs-toggle="tooltip" :data-bs-title="`${ member.characterCost(this.faction) } GP + ${ member.equipmentCost(this.faction) } GP`">
              {{ member.totalCost(this.faction) }} GP
            </div>
          </div>
        </div>
        <div class="btn-toolbar d-flex justify-content-md-between gap-1">
          <div class="btn-group">
            <button class="btn btn-outline-secondary" :aria-label="`Edit ${ member.get('name') }`" data-bs-toggle="modal" :data-bs-target="`#wbm_${ member.get('id') }_modal`" data-bs-title="Edit Name">
              <i class="bi-pencil"></i>
            </button>
            <button class="btn btn-outline-secondary" :aria-label="`Edit ${ member.get('name') }'s Equipment`" data-bs-toggle="collapse" :data-bs-target="`#wbm_${member.get('id')}_details`" data-bs-title="Equipment" @click="closeTooltips()">
              <i class="bi-shield"></i>
            </button>
          </div>
          <div class="btn-group" v-if="duplicable">
            <button class="btn btn-outline-secondary" :aria-label="`Duplicate entry`" data-bs-title="Duplicate" @click="$emit('requestDuplicate', member)">
              <i class="bi-files"></i>
            </button>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" :aria-label="`Delete ${ member.get('name') }`" @click="destroyTooltips(); $emit('requestMemberRemoval', member)" data-bs-title="Remove">
              <i class="bi-trash"></i>
            </button>
          </div>
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
      <div class="accordion-body px-0 px-md-4">
        <div class="border-secondary border-2 border-bottom d-flex flex-column flex-md-row justify-content-md-between align-items-md-center py-3">
          <strong class="mb-3 mb-md-0">Equipment</strong>
          <div class="btn-group">
            <multiselect
              @select="requestAddEquipment"
              :options="equipmentDropdownOptions"
              openDirection="bottom"
              group-values="options"
              group-label="name"
              label="name"
              track-by="id"
              class="equipment-dropdown"
            ></multiselect>
          </div>
        </div>
        <draggable
          v-model="equipmentList"
          handle=".equipment-handle"
          @start="drag=true"
          @end="drag=false; $emit('dirty')"
        >
          <template #item="{ element:equipment }">
            <div class="p-2 border-1 border-bottom d-flex justify-content-between align-items-center bg-white">
              <div><i class="bi-grip-vertical equipment-handle"></i>{{ equipment.get('armouryItem').get('name') }}</div>
              <div class="btn-toolbar gap-2 flex-shrink-0">
                <div class="btn-group">
                  <div class="input-group-text">
                    <span v-if="equipment.get('fixed')">
                      Free
                    </span>
                    <span v-if="!equipment.get('fixed')">
                      {{ equipment.totalCost() }} GP
                    </span>
                  </div>
                </div>
                <div class="btn-group" v-if="!equipment.get('fixed')">
                  <button class="btn btn-outline-secondary" @click="requestRemoveEquipment(equipment)" data-bs-title="Remove">
                    <i class="bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>
<script>
  import Multiselect from "vue-multiselect";
  import WarbandEquipment from '../models/warband-equipment';
  import { Modal, Tooltip } from 'bootstrap';
  import draggable from 'vuedraggable';

  export default {
    components: {
      Multiselect,
      draggable
    },
    data() {
      return {
        editFormValues: {
          name: this.member.get('name')
        }
      }
    },
    props: ['member', 'faction', 'common', 'list', 'duplicable', 'draggable'],
    computed: {
      equipmentList: {
        get() {
          return this.member.get('equipment');
        },
        set(val) {
          this.member.set('equipment', val);
        }
      },
      equipmentDropdownOptions() {
        return [
          {
            id: this.faction.get('id'),
            name: this.faction.get('name'),
            options: this.list.getArmoury().filter((opt) => this.member.isAllowedEquipment(opt)).map((opt) => {
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
    mounted() {
      this.assertTooltips();
    },
    methods: {
      requestAddEquipment(request) {
        this.member.get('equipment').push(new WarbandEquipment({ armouryItem: request.equipment }));
        setTimeout(this.assertTooltips, 10);
        setTimeout(this.updateCostTooltip, 10);
        this.$emit('dirty');
      },
      requestRemoveEquipment(equipment) {
        this.member.get('equipment').splice(this.member.get('equipment').indexOf(equipment), 1);
        this.closeTooltips();
        setTimeout(this.updateCostTooltip, 10);
        this.$emit('dirty');
      },
      saveEdits() {
        if (this.editFormValues.name == "") {
          this.editFormValues.name = this.member.get('character').get('name');
        }
        this.member.set('name', this.editFormValues.name);
        Modal.getInstance(this.$refs.memberEditModal).hide();
        this.$emit('dirty');
      },
      updateCostTooltip() {
        this.$refs.root.querySelectorAll("[data-bs-toggle='tooltip']").forEach((tt) => {
          let tto = Tooltip.getOrCreateInstance(tt);
          tto._config.title = tt.getAttribute('data-bs-title');
        })
      },
      assertTooltips() {
        this.$refs.root.querySelectorAll("[data-bs-title]").forEach((tt) => {
          Tooltip.getOrCreateInstance(tt);
        })
      },
      destroyTooltips() {
        this.$refs.root.querySelectorAll("[data-bs-title]").forEach((tt) => {
          Tooltip.getOrCreateInstance(tt).dispose();
        })
      },
      closeTooltips() {
        this.$refs.root.querySelectorAll("[data-bs-title]").forEach((tt) => {
          Tooltip.getOrCreateInstance(tt).hide();
        })
      }
    }
  }  
</script>