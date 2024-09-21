<template>
  <div class="character-card">
    <div class="character-card_contents">
      <div class="character-card_meta">
        <div class="character-card_meta_portrait">
          <img v-if="member.get('character').get('artwork')" :src="member.get('character').get('artwork')" :alt="member.get('name')"/>
          <img v-else src="/dist/images/character-card/default-artwork.png" :alt="member.get('name')" class="default-portrait"/>
        </div>
        <div class="character-card_meta_stats">
          <div class="character-card_meta_stats_stat ap">{{ member.getStats().ap }}</div>
          <div class="character-card_meta_stats_stat hp">{{ member.getStats().hp }}</div>
          <div class="character-card_meta_stats_stat move">{{ member.getStats().move }}</div>
          <div class="character-card_meta_stats_stat bravery">{{ member.getStats().bravery }}</div>
        </div>
      </div>
      <div class="character-card_rules">
        <div class="character-card_rules_section character-card_rules_attacks">
          <h3 class="h4 character-card_rules_section_header">
            {{ member.get('name') }}
          </h3>
          <ul class="list-unstyled">
            <li v-for="attack in member.getAttacks()">
              <strong class="d-block">(<span v-html="attack.type == 'melee' ? `${ attack.ap } AP` : 'Ranged'"></span>) {{ attack.name }}: <span class="text-nowrap">Power &ndash; {{ attack.power }}</span></strong>
              <p v-if="attack.special"><strong>Special:</strong> {{ attack.special }}</p>
            </li>
          </ul>
        </div>

        <div v-if="member.get('equipment').length > 0" class="character-card_rules_section character-card_rules_equipment">
          <h3 class="h4 character-card_rules_section_header">Equipment:</h3>
          <ul class="list-inline">
            <li v-for="equipment in member.get('equipment')" class="list-inline-item">
              <strong>{{ equipment.name() }} ({{ equipment.totalCost(faction, member) == 0 ? "Free" : equipment.totalCost() + " GP" }})</strong>
              <!-- <div v-html="equipment.description()"></div> -->
            </li>
          </ul>
        </div>
        <div v-if="member.getTraits().length > 0" class="character-card_rules_section character-card_rules_equipment">
          <h3 class="h4 character-card_rules_section_header">Traits:</h3>
          <ul class="list-inline">
            <li v-for="trait in member.getTraits()" class="list-inline-item">
              <strong>{{ trait.get('name') }}</strong>
              <!-- <div v-html="trait.get('description')"></div> -->
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  defineProps(['member', 'list']);
</script>
