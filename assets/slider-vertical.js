if (!customElements.get("slider-vertical")) {
    class SliderVertical extends HTMLElement {
        constructor() {
            super();
            this.upButton = this.querySelector('button[name="up"]');
            this.downButton = this.querySelector('button[name="down"]');
            this.panel = this.querySelector(".slider-vertical--panel");

            this.updateButtons();

            window.addEventListener(
                "resize",
                debounce(this.updateButtons.bind(this), 200)
            );
            this.panel.addEventListener(
                "scroll",
                this.updateButtons.bind(this)
            );

            this.upButton.addEventListener("click", (event) => {
                event.preventDefault();
                this.panel.scrollTop -=
                    this.panel.children[0].offsetHeight + this.getPanelGap();
                setTimeout(this.updateButtons.bind(this), 200);
            });

            this.downButton.addEventListener("click", (event) => {
                event.preventDefault();
                this.panel.scrollTop +=
                    this.panel.children[0].offsetHeight + this.getPanelGap();
                setTimeout(this.updateButtons.bind(this), 200);
            });
        }

        getPanelGap() {
            if ("computedStyleMap" in this.panel)
                return parseFloat(
                    this.panel.computedStyleMap().get("gap").toString()
                );
            else return "";
        }

        updateButtons() {
            const panel = this.panel;

            if (panel.scrollTop == 0) {
                this.upButton.style.setProperty("display", "none", "important");
            } else {
                this.upButton.style.setProperty("display", "");
            }

            if (panel.scrollHeight - panel.scrollTop == panel.clientHeight) {
                this.downButton.style.setProperty(
                    "display",
                    "none",
                    "important"
                );
            } else {
                this.downButton.style.setProperty("display", "");
            }
        }
    }

    customElements.define("slider-vertical", SliderVertical);
}
