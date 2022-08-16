import { createApp } from 'vue';
import AWLB from './components/ArcWorldeListBuilder.vue';

createApp({
	components: {
		'arcworlde-list-builder': AWLB
	}
}).mount('#list-builder');