/* Mutation observer to listen rating element appeare for squama elements */
(() => {
    const updateSquama = (mutationList, observer) => {
        for (const mutation of mutationList) {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains("spr-badge")) {
                    const squama = node.closest("squama-item");
                    const rating = parseFloat(node.dataset.rating);

                    if (!squama) return;

                    if ((squama.dataset.hasRating = rating > 0))
                        squama.reinit(squama);
                }
            });
        }
    };

    const options = { attributes: false, childList: true, subtree: true };
    const observer = new MutationObserver(updateSquama);

    observer.observe(document.body, options);
})();

/* Render rating at product listing after ajax requests */
document.body.addEventListener("renderProductGrid", (event) => {
    if (typeof SPR === "undefined") return;

    SPR.initDomEls();
    SPR.loadBadges();
});
