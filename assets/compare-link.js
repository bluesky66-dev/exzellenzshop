if (!customElements.get("compare-products-link")) {
    class CompareProductsLink extends HTMLElement {
        constructor() {
            super();

            this.link = this;
        }

        connectedCallback() {
            this.link?.addEventListener(
                "click",
                this.compareLinkDetails.bind(this)
            );
        }

        compareLinkDetails(e) {
            const popup = document.getElementById(CompareUtils.comparePopup);
            popup?.popupContent?.();
            //if (e.target.closest('details').hasAttribute('open'))
        }

        showComparePopup() {
            const popup = document.getElementById(CompareUtils.comparePopup);
            popup?.removeAttribute("hidden");
            document.querySelector("body").classList.add("compare--overlay");
        }

        disconnectedCallback() {
            this.link?.removeEventListener(
                "click",
                this.compareLinkDetails.bind(this)
            );
        }
    }

    customElements.define("compare-products-link", CompareProductsLink);
}
