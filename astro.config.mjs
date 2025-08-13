import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://joblist.today',
	integrations: [
		sitemap({
			customPages: [
				'https://components.joblist.today/apps/map',
				'https://components.joblist.today/apps/search',
				'https://components.joblist.today/apps/companies/',
				'https://edit.joblist.today/',
			],
		})
	]
});
