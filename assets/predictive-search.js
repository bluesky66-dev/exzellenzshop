if (!customElements.get("predictive-search")) {
    class PredictiveSearch extends HTMLElement {
        constructor() {
            super();
            this.cachedResults = {};
            this.input = this.querySelector('input[type="search"]');
            this.predictiveSearchResults = this.querySelector(
                "[data-predictive-search]"
            );
            this.searchQueryLength = this.querySelector(
                "#predictive_search_query_length"
            );
            this.types = this.querySelectorAll(
                '[name="predictive-search-types"]'
            );
            this.formBtn = this.querySelector("predictive-search button");
            this.isOpen = false;
            const shopifyFeatures =
                document.getElementById("shopify-features")?.innerHTML;
            if (JSON.parse(shopifyFeatures)?.predictiveSearch)
                this.setupEventListeners();
            else
                console.error(
                    "The theme language is not supported. Details  https://shopify.dev/docs/api/ajax/reference/predictive-search#supported-languages"
                );
        }

        setupEventListeners() {
            const form = this.querySelector("form.search");
            form.addEventListener("submit", this.onFormSubmit.bind(this));

            this.input.addEventListener(
                "input",
                debounce((event) => {
                    this.onChange(event);
                }, 300).bind(this)
            );
            this.input.addEventListener("focus", this.onFocus.bind(this));

            this.addEventListener("focusout", this.onFocusOut.bind(this));
            this.addEventListener("keyup", this.onKeyup.bind(this));
            this.addEventListener("keydown", this.onKeydown.bind(this));

            if (this.input?.form.className.includes("search--icon"))
                this.formBtn?.addEventListener(
                    "click",
                    this.onBtnClick.bind(this)
                );
        }

        onBtnClick(e) {
            e.preventDefault();

            let searchField = this.querySelector(".field"),
                form = this.querySelector("form");

            form.classList.toggle("active");
            if (searchField.classList.toggle("shown"))
                setTimeout(() => {
                    searchField.querySelector(".search__input").focus();
                }, 150);

            if (
                !searchField.classList.contains("shown") ||
                !form.classList.contains("active")
            )
                this.close(true);
        }

        getQuery() {
            return this.input.value.trim();
        }

        getMinQueryLength() {
            return this.searchQueryLength.value;
        }

        onChange() {
            const searchTerm = this.getQuery();
            const minQueryLimit = this.getMinQueryLength();

            if (!searchTerm.length) {
                this.close(true);
                return;
            }

            this.getSearchResults(searchTerm, minQueryLimit);
        }

        onFormSubmit(event) {
            if (
                !this.getQuery().length ||
                this.querySelector('[aria-selected="true"] a')
            )
                event.preventDefault();
        }

        onFocus() {
            const searchTerm = this.getQuery();

            if (!searchTerm.length) return;

            if (this.getAttribute("results") === "true") {
                this.open();
            } else {
                this.getSearchResults(searchTerm);
            }
        }

        onFocusOut() {
            setTimeout(() => {
                if (!this.contains(document.activeElement)) this.close();
            });
        }

        onKeyup(event) {
            if (!this.getQuery().length) this.close(true);
            event.preventDefault();

            switch (event.code) {
                case "ArrowUp":
                    this.switchOption("up");
                    break;
                case "ArrowDown":
                    this.switchOption("down");
                    break;
                case "Enter":
                    this.selectOption();
                    break;
            }
        }

        onKeydown(event) {
            // Prevent the cursor from moving in the input when using the up and down arrow keys
            if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                event.preventDefault();
            }
        }

        switchOption(direction) {
            if (!this.getAttribute("open")) return;

            const moveUp = direction === "up";
            const selectedElement = this.querySelector(
                '[aria-selected="true"]'
            );
            const allElements = this.querySelectorAll("li");
            let activeElement = this.querySelector("li");

            if (moveUp && !selectedElement) return;

            this.statusElement.textContent = "";

            if (!moveUp && selectedElement) {
                activeElement =
                    selectedElement.nextElementSibling || allElements[0];
            } else if (moveUp) {
                activeElement =
                    selectedElement.previousElementSibling ||
                    allElements[allElements.length - 1];
            }

            if (activeElement === selectedElement) return;

            activeElement.setAttribute("aria-selected", true);
            if (selectedElement)
                selectedElement.setAttribute("aria-selected", false);

            this.setLiveRegionText(activeElement.textContent);
            this.input.setAttribute("aria-activedescendant", activeElement.id);
        }

        selectOption() {
            const selectedProduct = this.querySelector(
                '[aria-selected="true"] a, [aria-selected="true"] button'
            );

            if (selectedProduct) selectedProduct.click();
        }

        getSelectedTypes(types) {
            let selectedTypes = "";
            types.forEach((type) => {
                if (type.value.includes("true")) {
                    selectedTypes += "," + type.value.split("-")[0];
                }
            });
            return selectedTypes;
        }

        getSearchResults(searchTerm, minQueryLimit = false) {
            /* min query length for appropriate search result */
            if (searchTerm.length < minQueryLimit) return;

            const queryKey = searchTerm.replace(" ", "-").toLowerCase();
            this.setLiveRegionLoadingState();

            if (this.cachedResults[queryKey]) {
                this.renderSearchResults(this.cachedResults[queryKey]);
                return;
            }
            let typeParams = this.getSelectedTypes(this.types);
            fetch(
                `${routes.predictive_search_url}?q=${encodeURIComponent(
                    searchTerm
                )}&${encodeURIComponent(
                    "resources[type]"
                )}=product${typeParams}&section_id=predictive-search`
            )
                .then((response) => {
                    if (!response.ok) {
                        var error = new Error(response.status);
                        this.close();
                        throw error;
                    }

                    return response.text();
                })
                .then((text) => {
                    const resultsMarkup = new DOMParser()
                        .parseFromString(text, "text/html")
                        .querySelector(
                            "#shopify-section-predictive-search"
                        ).innerHTML;
                    this.cachedResults[queryKey] = resultsMarkup;
                    this.renderSearchResults(resultsMarkup);
                })
                .catch((error) => {
                    this.close();
                    throw error;
                });
        }

        setLiveRegionLoadingState() {
            this.statusElement =
                this.statusElement ||
                this.querySelector(".predictive-search-status");
            this.loadingText =
                this.loadingText || this.getAttribute("data-loading-text");

            this.setLiveRegionText(this.loadingText);
            this.setAttribute("loading", true);
        }

        setLiveRegionText(statusText) {
            this.statusElement.setAttribute("aria-hidden", "false");
            this.statusElement.textContent = statusText;

            setTimeout(() => {
                this.statusElement.setAttribute("aria-hidden", "true");
            }, 1000);
        }

        renderSearchResults(resultsMarkup) {
            this.predictiveSearchResults.innerHTML = resultsMarkup;
            this.predictiveSearchResults.dispatchEvent(
                new CustomEvent("renderProductGrid", { bubbles: true })
            );
            this.setAttribute("results", true);

            this.setLiveRegionResults();
            this.open();
        }

        setLiveRegionResults() {
            this.removeAttribute("loading");
            this.setLiveRegionText(
                this.querySelector(
                    "[data-predictive-search-live-region-count-value]"
                ).textContent
            );
        }

        getResultsMaxHeight() {
            const headerSection =
                this.closest(".shopify-section") ||
                document.querySelector("header");
            this.resultsMaxHeight =
                window.innerHeight -
                headerSection.getBoundingClientRect().bottom;
            return this.resultsMaxHeight;
        }

        open() {
            this.predictiveSearchResults.style.maxHeight =
                this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
            this.setAttribute("open", true);
            this.input.setAttribute("aria-expanded", true);
            this.isOpen = true;

            document.body.classList.add("overflow_hidden");
        }

        close(clearSearchTerm = false) {
            if (clearSearchTerm) {
                this.input.value = "";
                this.removeAttribute("results");
            }

            const selected = this.querySelector('[aria-selected="true"]');

            if (selected) selected.setAttribute("aria-selected", false);

            this.input.setAttribute("aria-activedescendant", "");
            this.removeAttribute("open");
            this.input.setAttribute("aria-expanded", false);
            this.resultsMaxHeight = false;
            this.predictiveSearchResults.removeAttribute("style");

            this.isOpen = false;

            document.body.classList.remove("overflow_hidden");
        }
    }

    customElements.define("predictive-search", PredictiveSearch);
}
