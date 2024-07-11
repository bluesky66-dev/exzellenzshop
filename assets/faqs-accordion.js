class FaqsAccordion extends HTMLElement {
    animateOptions = {
        duration: 300,
        easing: "linear",
    };

    constructor() {
        super();

        this.querySelectorAll(".faq-title").forEach((title) => {
            const details = title.parentElement;
            const content = details && details.querySelector(".faq-content");

            if (content) {
                details.open = true;
                content.style.height = "0px";
                content.style.overflow = "hidden";
            }

            title.addEventListener("click", (event) => {
                event.preventDefault();

                if (title.classList.contains("open")) this.hide(content);
                else this.show(content);

                title.classList.toggle("open");
            });
        });
    }

    show(element) {
        var animation = element.animate(
            { height: ["0", element.scrollHeight + "px"] },
            this.animateOptions
        );

        animation.onfinish = () => {
            element.style.height = "initial";
        };
    }

    hide(element) {
        var animation = element.animate(
            { height: [element.clientHeight + "px", "0"] },
            this.animateOptions
        );

        animation.onfinish = () => {
            element.style.height = "0";
        };
    }
}

customElements.define("faqs-accordion", FaqsAccordion);
