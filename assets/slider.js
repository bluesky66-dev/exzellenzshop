if (!customElements.get("slider-component")) {
    class SliderComponent extends HTMLElement {
        #play;

        constructor() {
            super();
            this.slider = this.querySelector("ul");
            if (!this.slider) return;

            this.sliderItems = this.querySelectorAll(
                this.dataset?.sliderItem || "li"
            );
            this.pageCount = this.querySelector(".slider-counter--current");
            this.pageTotal = this.querySelector(".slider-counter--total");
            this.prevButton = this.querySelector('button[name="previous"]');
            this.nextButton = this.querySelector('button[name="next"]');
            this.pagination = this.querySelector(".slider-pagination");
            this.lastPaginationUpdate = 0;

            if (this.nextButton) {
                this.prevButton.addEventListener(
                    "click",
                    this.onButtonClick.bind(this)
                );
                this.nextButton.addEventListener(
                    "click",
                    this.onButtonClick.bind(this)
                );
            }

            const resizeObserver = new ResizeObserver((entries) =>
                this.initPages()
            );
            resizeObserver.observe(this.slider);

            this.slider.addEventListener("scroll", this.update.bind(this));
            this.play();
        }

        initPages() {
            if (!this.sliderItems.length) return;

            this.slidesPerPage = Math.floor(
                this.slider.clientWidth / this.sliderItems[0].clientWidth
            );
            this.totalPages =
                this.slidesPerPage > this.sliderItems.length
                    ? 1
                    : this.sliderItems.length - this.slidesPerPage + 1;
            this.update();
        }

        update() {
            const width = this.getSliderDirection() * this.slider?.clientWidth;
            this.currentPage = Math.round(this.slider.scrollLeft / width) + 1;

            if (this.currentPage === 1)
                this.prevButton?.setAttribute("disabled", true);
            else this.prevButton?.removeAttribute("disabled");

            let sliderScrollLeft =
                width > 0
                    ? this.slider.scrollLeft + width
                    : Math.abs(this.slider.scrollLeft + width);

            if (
                this.currentPage === this.totalPages ||
                sliderScrollLeft === this.slider.scrollWidth
            ) {
                this.nextButton?.setAttribute("disabled", true);
            } else this.nextButton?.removeAttribute("disabled");

            this.pagination !== null
                ? this.updatePagination()
                : this.activatePage(this.currentPage);

            if (!this.pageCount || !this.pageTotal) return;
            this.pageCount.textContent = this.currentPage;
            this.pageTotal.textContent = this.totalPages;
        }

        onButtonClick(event) {
            const button = event.currentTarget;
            const width =
                this.getSliderDirection() * this.sliderItems[0]?.clientWidth;

            event.preventDefault();
            const slideScrollPosition =
                button.name === "next"
                    ? this.slider.scrollLeft + width
                    : this.slider.scrollLeft - width;

            this.slider.scrollTo({
                left: slideScrollPosition,
            });
            this.stop();
            this.play();
        }

        updatePagination() {
            const slider = this.slider;
            const pages = this.pagination.children;

            // implement pagination update with throttle
            if (Date.now() - this.lastPaginationUpdate > 100) {
                let index = 0;

                for (let page of pages) {
                    if (index >= this.totalPages)
                        page.setAttribute("hidden", true);
                    else page.removeAttribute("hidden");

                    index++;
                }

                this.activatePage(this.currentPage);
                this.lastPaginationUpdate = Date.now();
            }
        }

        activatePage(pageNumber) {
            const sliders = this.slider.children;
            if (!sliders) return;

            const currentSlide = "slide-active";
            const pages = this.pagination && this.pagination.children;
            var slider;

            // remove active class from sliders
            [...sliders].forEach((slider) =>
                slider.classList.remove(currentSlide)
            );

            // add active class for current slider
            slider = sliders[pageNumber - 1];
            slider?.classList.add(currentSlide);

            /* slider content animation */
            this.sliderContentAnimation();

            if (!pages) return;

            const activePage = "page-active";
            var page, pageLeft, pageTop;

            // remove active class from all pages
            [...pages].forEach((page) => page.classList.remove(activePage));

            page = pages[pageNumber - 1];
            if (!page) return;

            // add active class to specific page
            page.classList.add(activePage);

            // check is page is fully visible
            pageLeft = page.offsetLeft - this.pagination.scrollLeft;
            if (
                pageLeft > this.pagination.clientWidth - page.clientWidth ||
                pageLeft < 0
            ) {
                this.pagination.scrollTo({
                    left: page.offsetLeft,
                });
            }

            pageTop = page.offsetTop - this.pagination.scrollTop;
            if (
                pageTop > this.pagination.clientHeight - page.clientHeight ||
                pageTop < 0
            ) {
                this.pagination.scrollTo({
                    top: page.offsetTop,
                });
            }

            /* slider content animation */
            //this.sliderContentAnimation();
        }

        activateSlide(slideIndex) {
            const slide = this.sliderItems[slideIndex];

            if (!slide) return;

            this.slider.scrollTo({
                left: slide.offsetLeft,
            });
        }

        play() {
            const wait = parseFloat(this.dataset.autoplay);

            if (!wait || isNaN(wait)) return;

            this.#play = setInterval(() => {
                const slideScrollPosition =
                    this.slider.scrollLeft + this.sliderItems[0].clientWidth;
                const isLastPage = this.currentPage === this.totalPages;

                if (this.dataset.loop == "false" && isLastPage) {
                    this.stop();
                } else {
                    this.slider.scrollTo({
                        left: isLastPage ? 0 : slideScrollPosition,
                    });
                }
            }, wait * 1000);
        }

        stop() {
            clearInterval(this.#play);
        }

        activateSlideAnimation(cnt) {
            const content = [...cnt].filter((c) => {
                return c;
            });
            content?.forEach((el) => el.classList.add("slide-top"));
        }

        getSliderDirection() {
            return document.dir === "rtl" ? -1 : 1;
        }

        diactivateSlideAnimation(slide) {
            const titles = slide.querySelectorAll(".title") || "";
            const descs = slide.querySelectorAll("p") || "";
            const btns = slide.querySelectorAll(".button") || "";
            const contents = new Set([titles, descs, btns]);

            contents?.forEach((content) => {
                if (content.length == 0) return;
                content.forEach((el) => el.classList.remove("slide-top"));
            });
        }

        sliderContentAnimation() {
            if (
                !this.slider.classList.contains("text-animation") ||
                window.innerWidth < 760
            )
                return;

            let slider,
                sliders = this.slider.children;

            [...sliders].forEach((slide) => {
                if (slide.classList.contains("slide-active")) {
                    const title = slide.querySelector(".title") || "";
                    const desc = slide.querySelector("p") || "";
                    const btn = slide.querySelector(".button") || "";
                    const content = new Set([title, desc, btn]);

                    this.activateSlideAnimation(content);
                } else this.diactivateSlideAnimation(slide);
            });
        }
    }

    customElements.define("slider-component", SliderComponent);
}
