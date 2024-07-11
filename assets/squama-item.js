if (!customElements.get("squama-item")) {
    class SquamaItem extends HTMLElement {
        connectedCallback() {
            this.extraPadding = 20;

            this.addEventListener("focusin", this.handleFocusIn);
            this.addEventListener("focusout", this.handleFocusOut);
            this.resizeUnsubscriber = subscribe(
                PUB_SUB_EVENTS.windowResizeX,
                this.reinit.bind(this)
            );
            this.reinit();
        }

        disconnectedCallback() {
            this.removeEventListener("focusin", this.handleFocusIn);
            this.removeEventListener("focusout", this.handleFocusOut);
            this.resizeUnsubscriber?.();
        }

        handleFocusIn() {
            this.setAttribute("data-focused", "");
        }

        handleFocusOut(event) {
            // remove data-focused when focus is out of squama-item
            if (!this.contains(event.relatedTarget)) {
                this.removeAttribute("data-focused");
                this.scrollTop = 0;
            }
        }

        reinit(squama = false) {
            if (!squama && window.visualViewport.width < 767) {
                this.uninit();
                return;
            }

            // disable hover effect if config option "Product card->Enabled hover effect" is unchecked
            if (
                this.closest("ul").dataset?.useHoverEffect &&
                !JSON.parse(this.closest("ul").dataset.useHoverEffect)
            ) {
                this.setItemFullHeight();
                return;
            }
            // allow to control only the grid items height via Product card configurations
            if (
                !this.hasAttribute("data-status") ||
                this.closest("ul").dataset.mode == "list"
            ) {
                setTimeout(() => {
                    // Set height for squama item on screens greater 767px.
                    // Other wise heigh is 'auto' using css rule
                    // if squama product reting more than "0", add squama items height extra padding
                    this.style.height = squama
                        ? this.clientHeight + this.extraPadding + "px"
                        : this.clientHeight + "px";

                    this.setAttribute("data-status", "ready");
                }, 100);
            }
            // properly displaying an item price nearly at the bottom. Add more paddings.
            if (
                this.hasAttribute("data-control-item-height") &&
                this.offsetHeight -
                    this.querySelector(".item-price").offsetTop <
                    this.extraPadding * 2
            ) {
                this.style.height =
                    parseInt(this.style.height) + this.extraPadding + "px";
            }
        }

        setItemFullHeight() {
            this.style.height = "auto";
            this.setAttribute("data-status", "ready");
        }

        uninit() {
            this.removeAttribute("data-status");
            this.style.removeProperty("height");
        }
    }

    customElements.define("squama-item", SquamaItem);
}
