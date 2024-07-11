const onReveal = (elements) => {
    let delay = 0.075;
    const options = {
        root: null,
        rootMargin: "0px 0px 150px 0px",
        threshold: 0.15,
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            // activate reveal class
            entry.target.classList.add("reveal-ready");
            observer.unobserve(entry.target);
        });
    }, options);
    const arrRevealItems = [];
    elements.forEach((element, i) => {
        const childs = element.querySelectorAll(".reveal-item");
        if (!childs.length) return;

        /*
         * observe element childs
         * sey element's childs delay
         */
        childs.forEach((child, i) => {
            observer.observe(child);
            child.style.animationDelay = i * delay + "s";
            arrRevealItems.push(child);
        });
    });

    // update z-index of revealItems to update their order visibility
    // fixed hover item effect
    arrRevealItems.forEach(
        (item, i) => (item.style.zIndex = arrRevealItems.length - i)
    );
};

function init() {
    const elements = document.querySelectorAll(".reveal-slide-in");
    elements.length && onReveal(elements);
}

init();
