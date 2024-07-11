class CartRemoveButton extends HTMLElement {
    constructor() {
        super();

        this.addEventListener("click", (event) => {
            event.preventDefault();
            this.closest("cart-items").updateQuantity(this.dataset.index, 0);
            showNotificationOnRemoveItem();
        });
    }
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
    constructor() {
        super();

        this.lineItemStatusElement = document.getElementById(
            "shopping-cart-line-item-status"
        );

        this.currentItemCount = Array.from(
            this.querySelectorAll('[name="updates[]"]')
        ).reduce(
            (total, quantityInput) => total + parseInt(quantityInput.value),
            0
        );

        this.debouncedOnChange = debounce((event) => {
            this.onChange(event);
        }, 300);

        this.addEventListener("change", this.debouncedOnChange.bind(this));
    }

    onChange(event) {
        this.updateQuantity(
            event.target.dataset.index,
            event.target.value,
            document.activeElement.getAttribute("name")
        );
    }

    getSectionsToRender() {
        return [
            {
                id: "main-cart-items",
                section: document.getElementById("main-cart-items").dataset.id,
                selector: "#main-cart-items .js-contents",
            },
            {
                id: "cart-icon-bubble",
                section: "cart-icon-bubble",
                selector: ".shopify-section",
            },
            {
                id: "cart-live-region-text",
                section: "cart-live-region-text",
                selector: ".shopify-section",
            },
            {
                id: "main-cart-footer",
                section: document.getElementById("main-cart-footer").dataset.id,
                selector: "#main-cart-footer .js-contents",
            },
        ];
    }

    updateQuantity(line, quantity, name) {
        this.enableLoading(line);

        if (quantity == 0) showNotificationOnRemoveItem();

        const body = JSON.stringify({
            line,
            quantity,
            sections: this.getSectionsToRender().map(
                (section) => section.section
            ),
            sections_url: window.location.pathname,
        });

        fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
            .then((response) => {
                return response.text();
            })
            .then((state) => {
                const parsedState = JSON.parse(state);
                this.classList.toggle("is-empty", parsedState.item_count === 0);
                document
                    .getElementById("main-cart-footer")
                    ?.classList.toggle(
                        "is-empty",
                        parsedState.item_count === 0
                    );

                this.getSectionsToRender().forEach((section) => {
                    const elementToReplace =
                        document
                            .getElementById(section.id)
                            .querySelector(section.selector) ||
                        document.getElementById(section.id);

                    elementToReplace.innerHTML = this.getSectionInnerHTML(
                        parsedState.sections[section.section],
                        section.selector
                    );
                });

                this.updateLiveRegions(line, parsedState.item_count);
                document
                    .getElementById(`CartItem-${line}`)
                    ?.querySelector(`[name="${name}"]`)
                    ?.focus();
                this.disableLoading();
            })
            .catch(() => {
                this.querySelectorAll(".loading-overlay").forEach((overlay) =>
                    overlay.classList.add("hidden")
                );
                document.getElementById("cart-errors").textContent =
                    window.cartStrings.error;
                this.disableLoading();
            });
    }

    updateLiveRegions(line, itemCount) {
        if (this.currentItemCount === itemCount) {
            const itemDetails = document.querySelector(
                `#CartItem-${line} .cart-item__details`
            );
            var message = itemDetails.querySelector(".message-wrapper");

            if (!message) {
                message = createFromTemplate("message-wrapper");
                itemDetails.append(message);
            }

            message.removeAttribute("hidden");
            message.querySelector(".error-message").innerHTML =
                window.cartStrings.quantityError.replace(
                    "[quantity]",
                    document.getElementById(`Quantity-${line}`).value
                );
        }

        this.currentItemCount = itemCount;
        this.lineItemStatusElement.setAttribute("aria-hidden", true);

        const cartStatus = document.getElementById("cart-live-region-text");
        cartStatus.setAttribute("aria-hidden", false);

        setTimeout(() => {
            cartStatus.setAttribute("aria-hidden", true);
        }, 1000);
    }

    getSectionInnerHTML(html, selector) {
        return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector).innerHTML;
    }

    enableLoading(line) {
        const itemTotals = this.querySelectorAll(".cart-item__totals").item(
            line - 1
        );

        if (!itemTotals.querySelector(".loading-overlay")) {
            itemTotals.prepend(createFromTemplate("template-loading-overlay"));
        }
        itemTotals && itemTotals.classList.add("loading");
        document
            .getElementById("main-cart-items")
            .classList.add("cart__items--disabled");
        document.activeElement.blur();
        this.lineItemStatusElement.setAttribute("aria-hidden", false);
    }

    disableLoading() {
        document
            .getElementById("main-cart-items")
            .classList.remove("cart__items--disabled");
    }
}

customElements.define("cart-items", CartItems);

class CartNote extends HTMLElement {
    constructor() {
        super();

        this.addEventListener(
            "change",
            debounce((event) => {
                const body = JSON.stringify({ note: event.target.value });
                fetch(`${routes.cart_update_url}`, {
                    ...fetchConfig(),
                    ...{ body },
                });
            }, 300)
        );
    }
}

customElements.define("cart-note", CartNote);

function windowScrollToTop() {
    const scrollTrigger = 300;
    let scrollTop = window.scrollY;

    if (scrollTop > scrollTrigger)
        window.scroll({ top: 20, behavior: "smooth" });
}

function showNotificationOnRemoveItem() {
    this.flowNotification = document.getElementById("flow-notification");

    if (this.flowNotification) {
        windowScrollToTop();

        setTimeout(() => {
            this.flowNotification.classList.remove("hidden");
        }, 500);

        setTimeout(() => {
            this.flowNotification.classList.add("hidden");
        }, 3500);
    }
}
