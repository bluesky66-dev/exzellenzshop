if (!customElements.get("select-color-variants")) {
    class SelectColorVariants extends HTMLElement {
        constructor() {
            super();

            this.swatchOptions = this.querySelectorAll(
                ".swatch-attribute-options"
            );
            this.productsItems = document.querySelectorAll(
                ".products .grid-item"
            );

            if (!this.swatchOptions.length) return;
            this.options = [...this.swatchOptions[0].children];
        }

        connectedCallback() {
            this.options.forEach((option) => {
                // prevent navigate to the product page on color swatch click
                option.addEventListener("click", (e) =>
                    this.variantStopPropagation(e)
                );

                // update media on color swatch hover
                option.addEventListener(
                    "mouseover",
                    this.variantChange.bind(this)
                );
            });
        }

        variantStopPropagation(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        updateToInitialImageOnMouseLeave(e) {
            const productItem = e.target.closest("squama-item");
            let productImgs = productItem.querySelectorAll(
                ".grid-item .media img"
            );

            if (productImgs.length == 0) return;

            productImgs.forEach((img) => {
                img.style.removeProperty("opacity");
                if (img.classList.contains("img_opacity_order"))
                    img.classList.remove("img_opacity_order");
            });
        }

        variantChange(currentVariant) {
            let sectionId = currentVariant.target.dataset.sectionId,
                productId = currentVariant.target.dataset.productId,
                variantSrc = currentVariant.target.dataset.variantSrc,
                warning = `The variant with the color '${currentVariant.target.dataset.color}' does not have any image applied.`;

            if (variantSrc === "null") {
                console.warn(warning);
                return;
            }

            this.productsItems?.forEach((item) => {
                let parentProductId = item.dataset.productId,
                    squamaItem = item.children[0],
                    mediaImgs =
                        squamaItem.firstElementChild.querySelectorAll(
                            ".media img"
                        );

                if (
                    mediaImgs.length > 1 &&
                    productId === parentProductId &&
                    sectionId === item.parentElement.dataset.id
                )
                    this.getSelectedVariantImg(mediaImgs, variantSrc);
            });

            // update to initial image on mouseleave
            const productSwatchoptions = currentVariant.target.closest(
                ".swatch-attribute-options"
            );
            productSwatchoptions.addEventListener(
                "mouseleave",
                this.updateToInitialImageOnMouseLeave.bind(this)
            );
        }

        showMedia(img) {
            img.style.zIndex = "1";
            img.style.opacity = "1";
            img.classList.add("img_opacity_order");
        }

        hideMedia(img) {
            img.style.zIndex = "0";
            img.style.opacity = "0";
            img.classList.remove("img_opacity_order");
        }

        getSelectedVariantImg(imgs, variant) {
            imgs.forEach((img) => {
                let imgSrcs = img.getAttribute("src"),
                    currentVariantImgId = variant
                        ?.split("?v=")[1]
                        .replace("&width=", ""),
                    currentVariantImg = variant?.split("/").pop(),
                    imgName = imgSrcs.split("/").pop();

                this.hideMedia(img); // hide all media

                if (
                    imgSrcs.indexOf(currentVariantImgId) > 0 &&
                    imgName.indexOf(currentVariantImg) === 0
                )
                    this.showMedia(img); // show active media
            });
        }

        disconnectedCallback() {
            this.options.forEach((option) => {
                option.removeEventListener(
                    "mouseover",
                    this.variantChange.bind(this)
                );
            });
        }
    }

    customElements.define("select-color-variants", SelectColorVariants);
}
