<template>
  <div class="lh-0 text-center">
    <h2 class="visually-hidden">Cords</h2>
    <CharacterCard v-for="member in list.get('commanders')" :member="member" :list="list"/>
    <CharacterCard v-for="member in list.get('members')" :member="member" :list="list"/>
  </div>
</template>
<script setup>
  import CharacterCard from './CharacterCard.vue';

  defineProps(['list']);
</script>
<style scoped>
  
</style>