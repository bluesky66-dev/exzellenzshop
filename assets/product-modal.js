if (!customElements.get("product-modal")) {
    class ProductModal extends ModalDialog {
        sum = 0;
        constructor() {
            super();
            this.bodyClass = "product-modal__opened";
            this.modalInner = this.querySelector(".product-media-modal--inner");
            this.media = this.querySelectorAll(
                ".product-media-modal--inner > *"
            );
            this.mediaThumbs = this.querySelectorAll(
                ".product-media-modal__thumbs > a"
            );
            this.zoom = this.querySelector(".modal__zoom-button");

            window.addEventListener("popstate", (event) => {
                this.hasAttribute("open") && this.hide();
            });
        }

        connectedCallback() {
            if (!this.media || !this.mediaThumbs) return;

            this.mediaThumbs.forEach((thumb) => {
                thumb.addEventListener("click", this.showThumbMedia.bind(this));
            });

            this.zoom.addEventListener("click", this.zoomMedia.bind(this));
        }

        hide() {
            this.initialSize(); // revert zoomed image to the initial size on modal close
            super.hide();
            document.body.classList.remove(this.bodyClass);
            window.pauseAllMedia();
        }

        show(opener) {
            window.location.hash = "product-modal";
            super.show(opener);
            document.body.classList.add(this.bodyClass);
            this.showActiveMedia();
        }

        showActiveMedia() {
            this.querySelectorAll(
                `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute(
                    "data-media-id"
                )}"])`
            ).forEach((element) => {
                element.classList.remove("active");
            });
            const activeMedia = this.querySelector(
                `[data-media-id="${this.openedBy.getAttribute(
                    "data-media-id"
                )}"]`
            );
            activeMedia.classList.add("active");
            activeMedia.scrollIntoView();

            if (activeMedia.nodeName == "IMG" && !activeMedia.complete)
                this.showLoading();

            this.mediaThumbs?.forEach((thumb) => {
                if (activeMedia.dataset.mediaId === thumb.dataset.mediaId)
                    thumb.classList.add("active");
            });

            if (
                activeMedia.nodeName == "DEFERRED-MEDIA" &&
                activeMedia
                    .querySelector("template")
                    ?.content?.querySelector(".js-youtube")
            )
                activeMedia.loadContent();
        }

        showThumbMedia(e) {
            e.preventDefault();

            this.initLoading().then(() => {
                const currentMediaId = e.target.closest("a").dataset.mediaId;

                this.mediaThumbs.forEach((thumb) =>
                    thumb.classList.remove("active")
                );

                this.media.forEach((media) => {
                    media.classList.remove("active");
                    this.modalInner.style.transform = "initial";
                    this.sum = 0;
                    if (media.dataset.mediaId == currentMediaId) {
                        media.classList.add("active");
                        e.target.closest("a").classList.add("active");
                        if (media.nodeName == "IMG" && !media.complete)
                            this.showLoading();

                        media.addEventListener("error", (event) => {
                            this.showLoading();
                            console.error(
                                `Something wrong with the media: ${media}`
                            );
                        });
                    }
                });
            });
        }

        initLoading() {
            return fetchLoaderHTML().then((html) => {
                if (!this.loader) {
                    this.insertAdjacentHTML("afterbegin", html);
                    this.loader = this.querySelector(".loading-overlay");
                }
            });
        }

        showLoading() {
            if (!this.loader) this.initLoading();
            this.loader && this.loader.classList.remove("hidden");
        }

        hideLoading() {
            this.loader && this.loader.classList.add("hidden");
        }

        zoomMedia(e) {
            this.sum += 1;
            if (this.sum == 1 || this.sum == 3)
                this.modalInner.style.transform = "scale(1.25)";

            if (this.sum == 2) {
                this.modalInner.style.transform = "scale(1.5)";
                this.zoom.firstElementChild?.setAttribute("hidden", true);
                this.zoom.lastElementChild?.removeAttribute("hidden");
            }

            if (this.sum > 3) this.initialSize();
        }

        initialSize() {
            this.modalInner.style.transform = "scale(1)";
            this.zoom.firstElementChild?.removeAttribute("hidden");
            this.zoom.lastElementChild?.setAttribute("hidden", true);
            this.sum = 0;
        }

        disconnectedCallback() {
            this.mediaThumbs.forEach((thumb) => {
                thumb.removeEventListener(
                    "click",
                    this.showActiveMedia.bind(this)
                );
            });

            this.zoom.removeEventListener("click", this.zoomMedia);
        }
    }

    customElements.define("product-modal", ProductModal);
}
