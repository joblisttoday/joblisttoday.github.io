customElements.define(
  "joblist-today",
  class extends HTMLElement {
    get companyId() {
      return this.getAttribute("company-id");
    }
    get isHomepage() {
      return window.location.pathname === "/";
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
      if (this.companyId) {
        this.replaceChildren(this.createCompany(this.companyId));
      }
    }
    createCompany(companyId) {
      const $company = document.createElement("joblist-company");
      $company.setAttribute("company-id", companyId);
      $company.setAttribute("full", true);
      return $company;
    }
  },
);
