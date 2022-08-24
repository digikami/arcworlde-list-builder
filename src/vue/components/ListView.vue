<template>
  <div class="modal-header sticky-top bg-white">
    <button class="btn btn-outline-secondary" @click="handlePrintRequest" data-bs-title="Print">
      <i class="bi-cloud-download"></i>
    </button>
    <div class="btn-group">
      <button :class="`btn btn-${ format == 'short' ? '' : 'outline-' }secondary`" @click="format = 'short'" data-bs-title="Short View">
        <i class="bi-list-columns"></i>
      </button>
      <button :class="`btn btn-${ format == 'full' ? '' : 'outline-' }secondary`" @click="format = 'full'" data-bs-title="Full View">
        <i class="bi-view-list"></i>
      </button>
    </div>
    <button class="btn btn-outline-secondary" @click="$emit('requestViewClose')" data-bs-title="Close">
      <i class="bi-x"></i>
    </button>
  </div>
  <div class="container warband_view" v-if="list" ref="listView">
    <WarbandFullView v-if="format == 'full'" :list="list"></WarbandFullView>
    <WarbandShortView v-if="format == 'short'" :list="list"></WarbandShortView>
  </div>
</template>
<script>
  import WarbandFullView from './WarbandFullView.vue';
  import WarbandShortView from './WarbandShortView.vue';
  import html2pdf from "html2pdf.js";

  export default {
    data() {
      return {
        format: 'full'
      }
    },
    props: ['list'],
    components: {
      "WarbandFullView": WarbandFullView,
      "WarbandShortView": WarbandShortView
    },
    methods: {
      handlePrintRequest() {
        document.querySelector('html').style.fontSize = "12px";
        html2pdf().from(this.$refs.listView).set({
          margin: [5, 10, 5, 10],
          filename: "warband.pdf"
        }).save().then(() => {
          document.querySelector('html').style.fontSize = "16px";
        });
      }
    }
  }
</script>