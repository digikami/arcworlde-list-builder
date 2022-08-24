<template>
  <div class="awlb">
    <ListList
      v-if="editWarband == null"
      :lists="lists"
      :factions="factions"
      :kingdoms="kingdoms"
      @requestEdit="handleEditRequest"
      @requestDelete="handleDeleteRequest"
      @requestView="handleViewRequest"
    ></ListList>

    <ListEditor
      v-if="editWarband != null"
      :list="editWarband"
      :kingdoms="kingdoms"
      :common="common"
      @close="handleEditorCloseRequest"
      @requestView="handleViewRequest"
    ></ListEditor>

    <div class="modal fade" id="list_view_modal" tabindex="-1" aria-labelledby="" aria-hidden="true" ref="listViewModal">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-body p-0">
            <ListView :list="viewWarband" @close="handleViewCloseRequest" @requestViewClose="handleViewCloseRequest"></ListView>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import ListList from './ListList.vue';
  import ListEditor from './ListEdit.vue';
  import ListView from './ListView.vue';
  // import API from '../api';
  import Warband from '../models/warband';
  import Kingdom from '../models/kingdom';
  import Faction from '../models/faction';
  import Character from '../models/character';
  import Common from '../models/common';
  import { Modal } from 'bootstrap';

  export default {
    data() {
      return {
        lists: [],
        kingdoms: [],
        common: {},
        editWarband: null,
        viewWarband: null
      }
    },
    computed: {
      factions() {
        let facs = this.kingdoms.reduce((prev, curr) => {
          if (curr.factions) {
            return prev.concat(curr.factions);
          } else {
            return prev;
          }
        }, []);
        return facs;
      }
    },
    components: {
      "ListList": ListList,
      "ListEditor": ListEditor,
      "ListView": ListView
    },
    created() {
      Promise.all([
        Kingdom.find('bestiary').then(() => {
          return Kingdom.all().then(kingdoms => {
            return Promise.all(kingdoms.map((kingdom) => {
              return kingdom.loadFactions().then(() => kingdom);
            })).then(ks => {
              this.kingdoms = ks;
            })
          })
        }),
        Common.find().then(common => {
          return common.loadData().then(() => common);
        }).then((common) => {
          this.common = common;
        })
      ]).then(() => {
        Warband.all().then(lists => {
          this.lists = lists;
        });
      })
    },

    methods: {
      handleEditRequest(list) {
        this.editWarband = list;
      },
      handleDeleteRequest(list) {
        this.lists.splice(this.lists.indexOf(list), 1);
        list.delete();
      },
      handleEditorCloseRequest() {
        let lastEdit = this.editWarband;
        this.editWarband = null;
        lastEdit.reset();
      },
      handleViewRequest(list) {
        this.viewWarband = list;
        Modal.getOrCreateInstance(this.$refs.listViewModal).show();
      },
      handleViewCloseRequest() {
        this.viewWarband = null;
        Modal.getInstance(this.$refs.listViewModal).hide();
      }
    }

  }
</script>