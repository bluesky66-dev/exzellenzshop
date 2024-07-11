if (!customElements.get("localization-form")) {
    class LocalizationForm extends HTMLElement {
        constructor() {
            super();
            this.elements = {
                input: this.querySelector(
                    'input[name="locale_code"], input[name="country_code"], input[name="currency_code"]'
                ),
                button: this.querySelector("button"),
                panel:
                    this.querySelector(".localization-panel") ||
                    this.querySelector("ul"),
            };
            this.elements.button.addEventListener(
                "click",
                this.openSelector.bind(this)
            );
            this.querySelectorAll("a").forEach((item) => {
                item.addEventListener("click", this.onItemClick.bind(this));
            });
            this.elements.button
                .querySelectorAll("i[data-code]")
                .forEach(this.insertFallbackIcon);
            this.onBodyClick = this.handleBodyClick.bind(this);
            this.addEventListener("keyup", this.handleKeyup.bind(this));
        }

        handleBodyClick(event) {
            if (
                !this.elements.button.contains(event.target) &&
                !this.elements.panel.contains(event.target)
            )
                this.closeSelector(event);
        }

        handleKeyup(event) {
            if (event.code.toUpperCase() === "ESCAPE") {
                this.closeSelector(event);
                event.stopPropagation();
            }
        }

        onItemClick(event) {
            event.preventDefault();
            this.elements.input.value = event.currentTarget.dataset.value;
            this.querySelector("form")?.submit();
        }

        openSelector() {
            this.elements.panel.toggleAttribute("hidden");
            this.elements.button.setAttribute(
                "aria-expanded",
                (
                    this.elements.button.getAttribute("aria-expanded") ===
                    "false"
                ).toString()
            );
            window.requestAnimationFrame(() => {
                // scroll to active item
                const link = this.querySelector(".disclosure__link--active");
                const item = link && link.closest(".disclosure__item");

                if (item)
                    item.parentNode.scrollTop =
                        item.offsetTop - item.parentNode.clientHeight / 2;

                setTimeout(() => {
                    trapFocus(
                        this.elements.panel,
                        this.querySelector(".disclosure__link--active")
                    );
                }, 100);
            });
            this.elements.panel
                .querySelectorAll("i[data-code]")
                .forEach(this.insertFallbackIcon);
            document.body.addEventListener("click", this.onBodyClick);
        }

        closeSelector(event) {
            const shouldClose =
                event.relatedTarget &&
                event.relatedTarget.nodeName === "BUTTON";
            if (
                event.relatedTarget === null ||
                typeof event.relatedTarget === "undefined" ||
                shouldClose
            ) {
                this.elements.button.setAttribute("aria-expanded", "false");
                this.elements.panel.setAttribute("hidden", true);
            }

            document.body.removeEventListener("click", this.onBodyClick);
            removeTrapFocus();
        }

        insertFallbackIcon(element) {
            const iconCode = (element.dataset.code || "").toLowerCase();

            if (!element.dataset.hasFallback && iconCode) {
                // as fallback use flag icons from https://github.com/HatScripts/circle-flags
                element.insertAdjacentHTML(
                    "afterbegin",
                    `<img src="https://hatscripts.github.io/circle-flags/flags/${iconCode}.svg" loading="lazy" />`
                );
                element.dataset.hasFallback = true;
            }
        }
    }

    customElements.define("localization-form", LocalizationForm);
}
