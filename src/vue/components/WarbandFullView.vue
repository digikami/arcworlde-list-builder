<template>
  <div class="warband_view-full">
    <header class="text-center">
      <h1>{{ list.get('name') }}</h1>
      <strong class="h5">
        {{ list.get('faction').get('name')}}
        <span v-if="list.get('subfaction')"> - {{ list.get('subfaction').name }}</span>
        <span v-if="list.get('faction').get('version')">({{ list.get('faction').get('version') }})</span>
        &mdash; <span class="text-nowrap">{{ list.totalCost() }} GP</span></strong>
    </header>
    <WarbandMemberView v-for="member in list.get('commanders')" :member="member" :list="list"></WarbandMemberView>
    <WarbandMemberView v-for="member in list.get('members')" :member="member" :list="list"></WarbandMemberView>
  </div>
</template>
<script>
  import WarbandMemberView from './WarbandMemberView.vue';

  export default {
    props: ['list'],
    components: {
      "WarbandMemberView": WarbandMemberView
    }
  }

</script>