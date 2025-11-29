<template>
  <div class="warband-member px-3 py-4" ref="root">
    <div class="d-flex flex-column flex-md-row justify-content-md-between gap-3">

      <strong :class="`accordion-header d-lg-flex flex-lg-row align-items-lg-center gap-2 fs-3 ${ member.get('character').get('name') == null ? 'text-danger' : ''}`" :id="`wbm_${member.get('id')}_header`">
        <i :class="`bi-grip-vertical handle ${ draggable ? '': 'opacity-0' }`"></i>
        {{ member.get('name') }} <small class="badge bg-secondary fs-6" v-if="member.get('name') != member.get('character').get('name')">{{ member.get('character').get('name') }}</small>
      </strong>

      <div v-if="member.get('character').hasVariants()">
        <select v-model="memberVariant" class="form-select fw-bold" @change="$emit('dirty')">
          <option v-for="variant in member.get('character').get('variants')" :value="variant.id" :selected="memberVariant == variant.id">{{ variant.name }}</option>
        </select>
      </div>

      <div class="d-flex gap-2 flex-shrink-0 align-items-center">
        <div class="btn-toolbar">
          <div class="btn-group">
            <div ref="memberCost" class="input-group-text" data-bs-toggle="tooltip" :data-bs-title="`${ list.getCharacterCost(member) } GP + ${ list.getMemberEquipmentCost(member) } GP`">
              {{ list.getMemberTotalCost(member) }} GP
            </div>
          </div>
        </div>
        <div class="btn-toolbar d-flex justify-content-md-between gap-1">
          <div class="btn-group">
            <button class="btn btn-outline-secondary" :aria-label="`View card for ${ member.get('name') }`" data-bs-toggle="modal" :data-bs-target="`#wbm_${ member.get('id') }_card`" data-bs-title="Card View">
              <i class="bi-postcard"></i>
            </button>
          </div>
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

    <div class="modal fade" :id="`wbm_${ member.get('id') }_card`" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="memberCardModal">
      <div class="modal-dialog modal-lg modal-fullscreen-lg-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="">Warband Member Card</h5>
            <button class="btn btn-outline-secondary" :disabled="isRenderingPrint" @click="printCard">
              <div v-if="isRenderingPrint" class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Processing...</span>
              </div>
              <i v-else class="bi-cloud-download"></i>
            </button>
          </div>
          <div class="modal-body text-center">
            <div ref="memberCard" class="lh-0 a6">
              <CharacterCard :member="member" :list="list" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
                      {{ equipment.totalCost(faction, member) }} GP
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
  import Faction from '../models/faction';
  import { Modal, Tooltip } from 'bootstrap';
  import draggable from 'vuedraggable';
  import CharacterCard from './CharacterCard.vue';
  import html2pdf from "html2pdf.js";

  export default {
    components: {
      Multiselect,
      draggable,
      CharacterCard,
    },
    data() {
      return {
        secrets: [],
        editFormValues: {
          name: this.member.get('name')
        },
        isRenderingPrint: false
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
      memberVariant: {
        get() {
          return this.member.get('variant')
        },
        set(val) {
          this.member.set('variant', val);
        }
      },
      equipmentDropdownOptions() {
        let options = [];
        // warband member equipment
        let memberEquipment = this.list.getArmoury().filter((opt) => {
          return this.member.isAllowedEquipment(opt);
        });
        if (memberEquipment.length) {
          options.push({
            id: 'warband',
            name: 'Warband Equipment',
            options: memberEquipment.map((opt) => {
              return {
                id: opt.get('id'),
                name: opt.get('name'),
                equipment: opt
              }
            })
          })
        }

        // warband faction equipment
        options.push({
          id: this.faction.get('id'),
          name: this.faction.get('name'),
          options: this.faction.get('armoury').filter((opt) => this.member.isAllowedEquipment(opt)).map((opt) => {
            return {
              id: opt.get('id'),
              name: opt.get('name'),
              equipment: opt
            }
          })
        });

        // character faction equipment
        if (this.faction.get('id') != this.member.get('character').get('factionId')) {
          let memberFaction = this.member.get('character').faction;
          options.push({
            id: memberFaction.get('id'),
            name: memberFaction.get('name'),
            options: memberFaction.get('armoury').filter((opt) => this.member.isAllowedEquipment(opt)).map((opt) => {
              return {
                id: opt.get('id'),
                name: opt.get('name'),
                equipment: opt
              }
            })
          })
        }

        // common equipment
        options.push({
          id: 'common',
          name: 'Common',
          options: this.common.get('armoury').map((opt) => {
            return {
              id: opt.get('id'),
              name: opt.get('name'),
              equipment: opt
            }
          })
        })
        return options
      }
    },
    mounted() {
      this.assertTooltips();
      const params = new URLSearchParams(window.location.search);
      this.secrets = (params.get('secrets') ?? '').split(',');
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
      },
      printCard() {
        this.isRenderingPrint = true;
        const settings = {
          html2canvas: { windowWidth: 1980, scale: 4 },
          jsPDF: { format: 'a6', orientation: 'l', putOnlyUsedFonts: true, compress: false },
          filename: 'character-card.pdf',
          image: { type: 'jpeg', quality: 1 }
        };
        html2pdf().from(this.$refs.memberCard).set(settings).save().then(() => {
          this.isRenderingPrint = false;
          console.log('save complete');
        });
      }
    }
  }  
</script>