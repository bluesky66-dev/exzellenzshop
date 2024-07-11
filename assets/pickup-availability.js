if (!customElements.get("pickup-availability")) {
    class PickupAvailability extends HTMLElement {
        constructor() {
            super();

            if (!this.hasAttribute("available")) return;

            this.errorHtml =
                this.querySelector(
                    "template"
                ).content.firstElementChild.cloneNode(true);
            this.onClickRefreshList = this.onClickRefreshList.bind(this);
            this.fetchAvailability(this.dataset.variantId);
        }

        fetchAvailability(variantId) {
            const variantSectionUrl = `${this.dataset.baseUrl}variants/${variantId}/?section_id=pickup-availability`;

            fetch(variantSectionUrl)
                .then((response) => response.text())
                .then((text) => {
                    const sectionInnerHTML = new DOMParser()
                        .parseFromString(text, "text/html")
                        .querySelector(".shopify-section");
                    this.renderPreview(sectionInnerHTML);
                })
                .catch((e) => {
                    this.querySelector("button")?.removeEventListener(
                        "click",
                        this.onClickRefreshList
                    );
                    this.renderError();
                });
        }

        onClickRefreshList(evt) {
            this.fetchAvailability(this.dataset.variantId);
        }

        renderError() {
            this.innerHTML = "";
            this.appendChild(this.errorHtml);

            this.querySelector("button").addEventListener(
                "click",
                this.onClickRefreshList
            );
        }

        renderPreview(sectionInnerHTML) {
            const drawer = document.querySelector("pickup-availability-drawer");
            if (drawer) drawer.remove();
            if (
                !sectionInnerHTML.querySelector("pickup-availability-preview")
            ) {
                this.innerHTML = "";
                this.removeAttribute("available");
                return;
            }

            this.innerHTML = sectionInnerHTML.querySelector(
                "pickup-availability-preview"
            ).outerHTML;
            this.setAttribute("available", "");

            this.appendChild(
                sectionInnerHTML.querySelector("pickup-availability-drawer")
            );

            this.querySelector('button, [data-action="show"]').addEventListener(
                "click",
                (evt) => {
                    evt.preventDefault();
                    document.querySelector("pickup-availability-drawer").show();
                }
            );
        }
    }

    customElements.define("pickup-availability", PickupAvailability);
}

if (!customElements.get("pickup-availability-drawer")) {
    class PickupAvailabilityDrawer extends HTMLElement {
        constructor() {
            super();

            this.onBodyClick = this.handleBodyClick.bind(this);

            this.querySelector("button").addEventListener("click", (evt) => {
                evt.preventDefault();
                this.hide();
            });

            this.addEventListener("keyup", () => {
                if (event.code.toUpperCase() === "ESCAPE") this.hide();
            });
        }

        handleBodyClick(evt) {
            const target = evt.target;
            if (
                target != this &&
                !target.closest("pickup-availability-drawer") &&
                target.id != "ShowPickupAvailabilityDrawer"
            ) {
                this.hide();
            }
        }

        hide() {
            this.removeAttribute("open");
            document.body.removeEventListener("click", this.onBodyClick);
            removeTrapFocus(this.activeElement);
            delete this.dataset.dropdownDir;
        }

        show() {
            const possibleTop = this.getBoundingClientRect().top;
            const possibleBottom =
                window.innerHeight -
                (this.getBoundingClientRect().bottom + this.clientHeight);

            this.setAttribute("open", "");
            if (possibleBottom < 0) {
                this.dataset.dropdownDir = "toTop";
                setTimeout(() => {
                    if (this.getBoundingClientRect().top < 0)
                        this.scrollIntoView({ behavior: "smooth" });
                }, 300);
            } else {
                this.dataset.dropdownDir = "toBottom";
            }
            document.body.addEventListener("click", this.onBodyClick);
            // add short delay so browser could find element to focus
            // when there is animations it can be tricky for browser
            setTimeout(() => {
                this.activeElement = document.activeElement;
                trapFocus(this, this.querySelector(".modal__close-button"));
            }, 100);
        }
    }

    customElements.define(
        "pickup-availability-drawer",
        PickupAvailabilityDrawer
    );
}
