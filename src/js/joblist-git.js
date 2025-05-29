/*
	 <!-- https://github.com/isomorphic-git/lightning-fs -->
	 <!-- https://isomorphic-git.org/docs/en/quickstart -->
	 <script src="https://unpkg.com/@isomorphic-git/lightning-fs"></script>
	 <script src="https://unpkg.com/isomorphic-git@beta"></script>
 */
import http from 'https://cdn.jsdelivr.net/npm/isomorphic-git@beta/http/web/index.js'
import LightningFS from 'https://cdn.jsdelivr.net/npm/@isomorphic-git/lightning-fs@4.6.0/+esm'

window.fs = new LightningFS('fs')
window.pfs = window.fs.promises

customElements.define(
	"joblist-git",
	class extends HTMLElement {
		async connectedCallback() {

			// Initialize Git configuration
			const cwd = "/data";
			const gitConfig = {
				fs: window.fs,
				http: window.http,
				dir: cwd,
				corsProxy: 'https://cors.isomorphic-git.org',
				url: 'https://github.com/joblisttoday/data.git',
				ref: 'main',
				singleBranch: true,
				depth: 1,
				author: {
					name: "joblist",
					email: "joblistgitlab+notexist@duck.com",
				}
			};

			// Check if data directory exists, if not, clone the repository
			let dirData;
			try {
				dirData = await window.pfs.readdir(cwd);
			} catch(e) {
				await window.pfs.mkdir(cwd);
			}
			if (!dirData.length) {
				await window.git.clone(gitConfig);
			} else {
				await window.git.pull(gitConfig);
			}

			// Read company data from files
			const dirCompanies = `${cwd}/companies`;
			const slugs = await window.pfs.readdir(dirCompanies);

			const companiesDataPromises = slugs.map(slug => window.pfs.readFile(`${dirCompanies}/${slug}/index.json`, { encoding: "utf8" }));
			const resCompanies = await Promise.all(companiesDataPromises);
			const companies = resCompanies.map(rawCompany => {
				try {
					return JSON.parse(rawCompany);
				} catch(e) {
					console.info("Issue with", rawCompany, e);
					return null;
				}
			});

			// Create joblist-company elements and append them to joblist-companies
			const $companies = companies.map(company => {
				if (company) {
					const $company = document.createElement("joblist-company");
					$company.setAttribute("company", JSON.stringify(company));
					return $company;
				}
			}).filter(Boolean);

			this.replaceChildren(...$companies);
		}
	}
);
