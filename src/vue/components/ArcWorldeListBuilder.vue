<template>
  <div class="awlb">
    <ListList v-if="editWarband == null" :lists="lists" :factions="factions" :kingdoms="kingdoms" @requestEdit="handleEditRequest" @requestDelete="handleDeleteRequest"></ListList>
    <ListEditor v-if="editWarband != null" :list="editWarband" :kingdoms="kingdoms" :common="common" @close="handleEditorCloseRequest"></ListEditor>
  </div>
</template>
<script>
  import ListList from './ListList.vue';
  import ListEditor from './ListEdit.vue';
  // import API from '../api';
  import Warband from '../models/warband';
  import Kingdom from '../models/kingdom';
  import Faction from '../models/faction';
  import Character from '../models/character';
  import Common from '../models/common';

  export default {
    data() {
      return {
        lists: [],
        kingdoms: [],
        common: {},
        editWarband: null
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
      "ListEditor": ListEditor
    },
    created() {
      Promise.all([
        Kingdom.all().then(kingdoms => {
          return Promise.all(kingdoms.map((kingdom) => {
            return kingdom.loadFactions().then(() => kingdom);
          })).then(ks => {
            this.kingdoms = ks;
          })
        }),
        Common.find().then(common => {
          return common.loadArmoury().then(() => common);
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
      }
    }

  }
</script>