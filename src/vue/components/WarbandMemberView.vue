<template>
  <div class="warband_member_view mb-5">
    <div class="character_grid text-center my-3">
      <div class="character_grid-header bg-dark text-white p-3">
        <h2 class="h4 m-0">
          {{ member.get('name') }} <span v-if="member.get('variant') && member.get('name') == member.get('character').get('name')">({{ member.getVariantData().name }})</span>
          <span v-if="member.get('name') != member.get('character').get('name')">({{ member.get('character').get('name') + (member.get('variant') ? ` - ${member.getVariantData().name}` : "")}})</span>
          &mdash; <span class="text-nowrap">{{ list.getMemberTotalCost(member) }} GP</span>
        </h2>
      </div>

      <div class="h5 m-0 p-2 character_grid-stat-label character_grid-class-label">
        Class
      </div>
      <div class="h5 m-0 p-2 character_grid-stat-value character_grid-class-value">
        {{ member.get('character').getVariant('class', member.get('variant')).join(' / ') }}
      </div>

      <div class="h5 m-0 p-2 character_grid-stat-label character_grid-ap-label">
        AP
      </div>
      <div class="h5 m-0 p-2 character_grid-stat-value character_grid-ap-value">
        {{ member.getStats().ap }}
      </div>

      <div class="h5 m-0 p-2 character_grid-stat-label character_grid-move-label">
        Movement
      </div>
      <div class="h5 m-0 p-2 character_grid-stat-value character_grid-move-value">
        {{ member.getStats().move }}
      </div>

      <div class="h5 m-0 p-2 character_grid-stat-label character_grid-brave-label">
        Bravery
      </div>
      <div class="h5 m-0 p-2 character_grid-stat-value character_grid-brave-value">
        {{ member.getStats().bravery }}
      </div>

      <div class="h5 m-0 p-2 character_grid-stat-label character_grid-hp-label">
        HP
      </div>
      <div class="h5 m-0 p-2 character_grid-stat-value character_grid-hp-value">
        {{ member.getStats().hp }}
      </div>
    </div>

    <div v-if="member.getBaseSize()" class="rec-base-size h4 text-md-center">
      Rec. Base Size:
      <div class="base">
        {{ member.getBaseSize() }}mm
      </div>
    </div>

    <h3 class="h4">Attacks:</h3>
    <ul>
      <li v-for="attack in member.getAttacks()" class="my-3">
        <strong class="d-block">(<span v-html="attack.type == 'melee' ? `${ attack.ap } AP` : 'Ranged'"></span>) {{ attack.name }}: <span class="text-nowrap">Power &ndash; {{ attack.power }}</span></strong>
        <p v-if="attack.special"><strong>Special:</strong> {{ attack.special }}</p>
      </li>
    </ul>

    <div v-if="member.get('equipment').length > 0">
      <h3 class="h4">Equipment:</h3>
      <ul class="list-inline">
        <li v-for="equipment in member.get('equipment')" class="list-inline-item">
          <strong>{{ equipment.name() }} ({{ equipment.totalCost(faction, member) == 0 ? "Free" : equipment.totalCost() + " GP" }})</strong>
          <!-- <div v-html="equipment.description()"></div> -->
        </li>
      </ul>
    </div>
    <div v-if="member.getTraits().length > 0">
      <h3 class="h4">Traits:</h3>
      <ul class="list-inline">
        <li v-for="trait in member.getTraits()" class="list-inline-item">
          <strong>{{ trait.get('name') }}</strong>
          <!-- <div v-html="trait.get('description')"></div> -->
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['member', 'list']
  }
</script>