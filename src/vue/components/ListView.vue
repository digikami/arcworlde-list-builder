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
      <button :class="`btn btn-${ format == 'card' ? '' : 'outline-' }secondary`" @click="format = 'card'" data-bs-title="Card View">
        <i class="bi-postcard"></i>
      </button>
    </div>
    <button class="btn btn-outline-secondary" @click="$emit('requestViewClose')" data-bs-title="Close">
      <i class="bi-x"></i>
    </button>
  </div>
  <div class="modal-body p-0">
    <div class="container warband_view p-0" v-if="list" ref="listView">
      <WarbandFullView v-if="format == 'full'" :list="list"></WarbandFullView>
      <WarbandShortView v-if="format == 'short'" :list="list"></WarbandShortView>
      <WarbandCardView v-if="format == 'card'" :list="list"></WarbandCardView>
    </div>
  </div>
</template>
<script>
  import WarbandFullView from './WarbandFullView.vue';
  import WarbandShortView from './WarbandShortView.vue';
  import WarbandCardView from './WarbandCardView.vue';
  import html2pdf from "html2pdf.js";

  export default {
    data() {
      return {
        secrets: [],
        format: 'full'
      }
    },
    props: ['list'],
    components: {
      "WarbandFullView": WarbandFullView,
      "WarbandShortView": WarbandShortView,
      "WarbandCardView": WarbandCardView,
    },
    mounted() {
      const params = new URLSearchParams(window.location.search);
      this.secrets = (params.get('secrets') ?? '').split(',');
    },
    methods: {
      handlePrintRequest() {
        document.querySelector('html').style.fontSize = "12px";
        const settings = this.format === 'card'
          ? {
            html2canvas: { windowWidth: 1980 },
            jsPDF: { format: 'a4', orientation: 'l' },
            image: { type: 'jpg', quality: 1 }
          }
          : {
            html2canvas: { windowWidth: 1980 },
            margin: [5, 10, 5, 10]
          };
        settings.filename = "warband.pdf";
        html2pdf().from(this.$refs.listView).set(settings).save().then(() => {
          document.querySelector('html').style.fontSize = "16px";
        });
      }
    }
  }
</script>