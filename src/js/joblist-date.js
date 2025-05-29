customElements.define(
	"joblist-date",
	class extends HTMLElement {
		connectedCallback() {
			this.replaceChildren(
				new Date().toLocaleString("en-us", {
					year: "numeric",
					month: "short",
					day: "numeric",
				}),
			);
		}
	},
);
