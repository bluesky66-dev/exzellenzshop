class BoughtTogether extends HTMLElement {
    constructor() {
        super();

        const mainPrice = this.getMainPrice();
        const mainForm = this.getMainForm();

        // Update element total price
        this.addEventListener("change", this.updateTotal.bind(this));

        // Listen price change for main product
        this.mainPriceMutation = new MutationObserver(() => {
            const input = this.querySelector('input[name="items[0][id]"]');

            this.updateTotal();

            if (this.isMainSoldout()) input.setAttribute("disabled", true);
            else input.removeAttribute("disabled");
        });

        if (mainPrice) {
            this.mainPriceMutation.observe(
                mainPrice.closest('[data-updatable="true"]'),
                { childList: true, subtree: true }
            );
        }

        // Listen variant ID change for main product
        mainForm?.addEventListener?.("change", () => {
            const variantId = mainForm.querySelector('input[name="id"]').value;

            this.querySelector('input[name="items[0][id]"]').value = variantId;
        });
    }

    collectTotal() {
        var itemsTotal = 0;

        itemsTotal += this.isMainSoldout()
            ? 0 // doesn't add main product price if product is not available
            : parseInt(this.getMainPrice()?.dataset.amount.replace(/\D/g, ""));

        this.querySelectorAll(
            '[type="checkbox"]:checked ~ .item-link .price--final'
        ).forEach((el) => {
            itemsTotal += parseInt(el.dataset.amount.replace(/\D/g, ""));
        });

        return itemsTotal;
    }

    updateTotal() {
        const decimalsSeparator = this.getPriceDecimalSeparator();
        const template = this.querySelector(
            'template[data-id="price"]'
        ).innerHTML;
        const total = this.collectTotal().toString();

        var int, dec;

        [int, dec] = this.getSamplePrice().split(decimalsSeparator);

        this.querySelector(".summary .price--final").outerHTML = template
            .replaceAll(int, total.slice(0, total.length - dec.length))
            .replaceAll(dec, total.slice(-dec.length));
    }

    getMainPrice() {
        return document.querySelector(".product-section .price--final");
    }

    getMainForm() {
        return document.querySelector(".product-section product-form");
    }

    isMainSoldout() {
        return !!this.getMainPrice().closest(".price--sold-out");
    }

    getSamplePrice() {
        return this.querySelector('template[data-id="price"]')?.dataset
            .priceSample;
    }

    getPriceDecimalSeparator() {
        if (this.getSamplePrice().indexOf(",") !== -1) return ",";

        return ".";
    }
}

customElements.define("bought-together", BoughtTogether);
