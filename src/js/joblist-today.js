customElements.define(
	"joblist-today",
	class extends HTMLElement {
		get companyId() {
			const id = this.getAttribute("company-id");
			if (this.isHomepage && this.isSubdomain && id) {
				return id;
			} else if (!this.isHomepage && !this.isSubdomain) {
				return window.location.pathname.split("/").filter((s) => !!s)[0];
			} else if (!this.isRootHost) {
				return window.location.hostname.split(".")[0];
			}
		}
		get isHomepage() {
			return window.location.pathname === "/";
		}
		get isSubdomain() {
			const domains = window.location.hostname.split(".");
			const topDomain = domains[domains.length - 1];
			if (domains.length === 2) {
				if (topDomain === "localhost") {
					return true;
				}
			} else if (domains.length >= 3) {
				return true;
			}
			return false;
		}
		closeMenu() {
			const $menuToggle = document.querySelector(
				'joblist-menu input[id="joblist-menu"]',
			);
			if ($menuToggle) {
				$menuToggle.checked = true;
			}
		}
		constructor() {
			super();
			document.querySelector("html").setAttribute("joblist-layout", true);

			// Inject Google Ads script if not already added
			if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
				const adsScript = document.createElement("script");
				adsScript.setAttribute("async", "");
				adsScript.setAttribute(
					"src",
					"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7578240828852744",
				);
				adsScript.setAttribute("crossorigin", "anonymous");
				document.head.appendChild(adsScript);
			}
		}
		connectedCallback() {
			if (!this.isSubdomain && this.isHomepage) {
				this.replaceChildren(this.createHomepage());
			} else if (this.companyId) {
				this.replaceChildren(this.createCompany(this.companyId));
			}
		}
		createHomepage() {
			const $template = document.createElement("wcu-template");
			$template.setAttribute("template", "page-index");
			return $template;
		}
		createCompany(companyId) {
			const $company = document.createElement("joblist-company");
			$company.setAttribute("company-id", companyId);
			$company.setAttribute("full", true);
			return $company;
		}
	},
);
