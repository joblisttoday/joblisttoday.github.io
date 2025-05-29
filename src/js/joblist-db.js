const DB_URL = "https://workers.joblist.today/joblist.db";

const LINK_ATTRS = {
  rel: "preload",
  as: "fetch",
  name: "joblist-db",
  href: DB_URL,
};

customElements.define(
  "joblist-db",
  class extends HTMLElement {
    get preloadDom() {
      return window.document.head.querySelector(
        'link[rel="preload"][as="fetch"][name="joblist-db"]',
      );
    }
    connectedCallback() {
      if (!this.preloadDom) {
        this.render();
      }
    }
    render() {
      const link = document.createElement("link");
      Object.entries(LINK_ATTRS).forEach(([attr, value]) => {
        link.setAttribute(attr, value);
      });
      window.document.head.append(link);
    }
  },
);
