<template>
  <div class="warband_view-short">
    <header class="text-center">
      <h1>{{ list.get('name') }}</h1>
      <strong class="h5">{{ list.get('faction').get('name')}}<span v-if="list.get('subfaction')"> - {{ list.get('subfaction').name }}</span> &mdash; {{ list.totalCost() }} GP</strong>
    </header>
    <h2 v-if="list.get('commanders').length > 0" class="h3 border-bottom border-2 border-dark">Commander<span v-if="list.get('commanders').length > 1">s</span></h2>

    <div v-for="member in list.get('commanders')" class="my-3">
      <div class="leader-row">
        <h3 class="h5 mb-0">{{ member.get('name') }} <small v-if="member.get('name') != member.get('character').get('name')">({{ member.get('character').get('name')}})</small></h3>
        <strong class="member-cost">{{ list.getMemberTotalCost(member) }} GP</strong>
      </div>
      <ul v-if="member.get('equipment').length > 0">
        <li v-for="equipment in member.get('equipment')" class="leader-row">
          <span class="equipment-name">{{ equipment.name() }}</span>
          <span class="equipment-cost">{{ equipment.totalCost() == 0 ? "Free" : `${equipment.totalCost()} GP`}}</span>
        </li>
      </ul>
    </div>

    <h2 v-if="list.get('members').length > 0" class="h3 border-bottom border-2 border-dark">Members</h2>
    <div v-for="member in list.get('members')" class="my-3">
      <div class="leader-row">
        <h3 class="h5 mb-0">{{ member.get('name') }} <small v-if="member.get('name') != member.get('character').get('name')">({{ member.get('character').get('name')}})</small></h3>
        <strong class="member-cost">{{ list.getMemberTotalCost(member) }} GP</strong>
      </div>
      <ul v-if="member.get('equipment').length > 0">
        <li v-for="equipment in member.get('equipment')" class="leader-row">
          <span class="equipment-name">{{ equipment.name() }}</span>
          <span class="equipment-cost">{{ equipment.totalCost() == 0 ? "Free" : `${equipment.totalCost()} GP`}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['list']
  }
</script>