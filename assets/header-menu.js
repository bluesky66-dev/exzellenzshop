if (!customElements.get("header-menu")) {
    class HeaderMenu extends HTMLElement {
        timingOptions = {
            duration: 350,
            easing: "linear",
        };
        constructor() {
            super();

            this.container = this.querySelector(".header__inline-menu > ul");
            this.detailsDisclosure = this.querySelectorAll(
                "details-disclosure > details"
            );
            this.overlay = document.querySelector(
                ".header-menu__overlay-element"
            );
            this.dropdownInnerItemImages = this.querySelectorAll(
                ".dropdown-inner > [data-item-image-index]"
            );

            /* remove dropdown menu links if config option is checked */
            this.dropdownInnerItemImages
                ? this.removeDropdownMenuLinks()
                : null;

            const dropdownInner = this.querySelectorAll(
                ".dropdown-inner.full-width"
            );
            if (this.container && dropdownInner)
                this.setMaxHeight(dropdownInner);
        }

        connectedCallback() {
            // remove overlay on click/hover
            if (this.container.dataset?.activateMenu == "on_click")
                this.overlay.addEventListener(
                    "click",
                    this.removeOverlay.bind(this)
                );
            else
                this.overlay.addEventListener(
                    "mouseenter",
                    this.removeOverlay.bind(this)
                );

            this.detailsDisclosure?.forEach((detail) => {
                // activate top level on click
                if (this.container.dataset?.activateMenu == "on_click") {
                    detail.addEventListener(
                        "click",
                        this.activateTopLevelOnClick.bind(this)
                    );
                } else {
                    // activate top level on hover - default behavior
                    detail.addEventListener(
                        "mousestop",
                        this.activateTopLevelOnHover.bind(this)
                    );

                    // navigate using the keyboard
                    detail.addEventListener("keydown", (e) => {
                        if (event.keyCode !== 13) return;
                        e.target.nextElementSibling.style.height = "auto";
                        e.target.closest("details").removeAttribute("closing");
                    });

                    detail.addEventListener(
                        "mouseleave",
                        this.mouseLeave.bind(this)
                    );
                }
                // highlight top level items when its child active
                this.highlightParentItemOnActiveChild(detail);
            });
        }

        updatePositionThirdLevelMenu(detail) {
            let dropdownInner = detail.children[1];
            if (!dropdownInner?.classList.contains("small")) return;

            let menuDisclosure = dropdownInner.querySelectorAll(
                ".childlist-menu--disclosure"
            );

            menuDisclosure.forEach((childlist) => {
                const elX = childlist.getBoundingClientRect().x;
                const elWidth = childlist.getBoundingClientRect().width;

                if (elX + elWidth > this.container.offsetWidth)
                    childlist.setAttribute("data-menu-position", "updated");
            });
        }

        activateTopLevelOnClick(e) {
            let detail = e.target.closest("details"),
                summary = e.target.closest("summary");

            // remove highlight class from all top items
            this.detailsDisclosure?.forEach((item) => {
                const summary = item.children[0];
                summary
                    ?.querySelector("a")
                    ?.classList.remove("list-menu__item--active");
            });

            this.closeOpenedDetails(detail);

            if (
                detail.parentElement.nodeName === "DETAILS-DISCLOSURE" &&
                e.target.nodeName !== "A"
            ) {
                e.preventDefault();
                e.stopPropagation();
                detail.setAttribute("open", true);
                this.showDropdownMenuWithAnimation(detail);

                /* show overlay only for Department item menu - small type */
                if (detail.parentElement.parentElement.dataset.mainItemMenu)
                    this.showOverlay();

                // highlight the active menu item
                summary?.children[0].classList.add("list-menu__item--active");
            }
        }

        closeOpenedDetails(currentDetail) {
            let dropdownInner = currentDetail.closest(".dropdown-inner.small");
            if (!dropdownInner) return;

            dropdownInner.querySelectorAll("details")?.forEach((detail) => {
                if (detail !== currentDetail) detail.removeAttribute("open");
            });
        }

        activateTopLevelOnHover(e) {
            let detail = e.target.closest("details");

            /* first item of small menu uses separate event */
            if (detail.parentElement.parentElement.dataset.mainItemMenu) {
                this.container.style.overflow = "visible";
                this.showOverlay();
            }
            detail.setAttribute("open", true);
            this.mouseOver(detail);
            this.showDropdownMenuWithAnimation(detail);
        }

        showOverlay() {
            this.overlay.classList.add("shown");
        }

        removeOverlay() {
            this.overlay.classList.remove("shown");
        }

        getSubMenuHeight(submenu) {
            this.subMenuHeight =
                submenu.getBoundingClientRect().bottom -
                submenu.getBoundingClientRect().top;
            return this.subMenuHeight;
        }

        setMinHeight(detail) {
            let childListsMenu = detail.querySelectorAll(
                ".childlist-menu--disclosure"
            );

            /* set childlist height as submenu height - Main item of small menu */
            if (
                !childListsMenu.length ||
                !detail.closest('li[data-main-item-menu="true"]')
            )
                return;

            childListsMenu.forEach((childList) => {
                childList.style.minHeight = this.subMenuHeight
                    ? `${this.subMenuHeight}px`
                    : `${this.getSubMenuHeight(detail.querySelector("ul"))}px`;
            });
        }

        mouseOver(detail) {
            // update position of childlist-menu--disclosure list (third-level)
            this.updatePositionThirdLevelMenu(detail);
            detail.removeAttribute("closing");
            const element = detail.children[1];

            // megamenu dropdown overlay
            if (
                element?.dataset?.megamenuUseOverlay &&
                element?.classList.contains("full-width")
            ) {
                this.overlay.style.top =
                    element.getBoundingClientRect().top +
                    detail.offsetHeight +
                    "px";
                this.showOverlay();
            } else if (element?.classList.contains("small")) {
                this.overlay.style.top = "0";
            }

            if (!detail.children[0].classList.contains("small")) return;
            // trigger small menu dropdown inner items
            detail.querySelectorAll("details")?.forEach((childDetail) => {
                childDetail.addEventListener("mouseenter", (e) => {
                    this.setMinHeight(childDetail);
                    setTimeout(() => {
                        childDetail.setAttribute("open", true);
                    }, 200);
                });

                childDetail.addEventListener(
                    "mouseleave",
                    this.mouseLeave.bind(this)
                );
            });
        }

        mouseLeave(event) {
            let detail = event.target;

            this.subMenuHeight = false; // reset submenu height
            this.hideDropdownMenu(detail);
            this.removeOverlay();

            setTimeout(() => {
                detail.removeAttribute("open");
            }, 200);
        }

        showDropdownMenuWithAnimation(detail) {
            if (
                !detail.closest("li").hasAttribute("item-index") ||
                !this.container.classList.contains(
                    "with--dropdown__menu-animation"
                ) ||
                detail.children[0].classList.contains("small")
            )
                return;

            const element = detail.children[1];
            element.setAttribute("opening", true);

            var animation = element.animate(
                { height: ["0", element.scrollHeight + "px"] },
                { padding: "0" },
                this.timingOptions
            );

            animation.onfinish = () => {
                element.style.padding = "1.5rem 0";
                element.style.height = element.scrollHeight + "px";
            };
        }

        hideDropdownMenu(detail) {
            if (
                !detail.closest("li").hasAttribute("item-index") ||
                !this.container.classList.contains(
                    "with--dropdown__menu-animation"
                ) ||
                detail.children[0].classList.contains("small")
            )
                return;

            detail.setAttribute("closing", true);
            const element = detail.children[1];
            var animation = element.animate(
                { height: [element.scrollHeight + "px", "0"] },
                this.timingOptions
            );

            animation.onfinish = () => {
                element.style.height = "0";
            };
        }

        removeDropdownMenuLinks() {
            const dropdownGrid = this.querySelectorAll(".container--grid");

            this.dropdownInnerItemImages.forEach((item) => {
                dropdownGrid?.forEach((dropdown) => {
                    if (
                        dropdown.children[0].dataset.itemIndex ===
                        item.dataset.itemImageIndex
                    )
                        dropdown.children[0].remove();
                });
            });
        }

        setMaxHeight(dropdown) {
            let inner_height = window.innerHeight,
                inner_width = window.innerWidth;

            if (inner_width < 980) return;

            let headerSectionHeight = document.querySelectorAll(
                    ".shopify-section-group-header-group"
                ),
                sum = 0;

            headerSectionHeight?.forEach((el) => {
                if (el.id.indexOf("_header") > 0) sum += el.offsetHeight; // get all header top sections height
            });

            dropdown.forEach((item) => {
                let innerHeightWithNoHeaderHeight = inner_height - sum;
                // fix for Firefox and Safari browsers
                // set dropdown inner max height
                item.style.maxHeight = innerHeightWithNoHeaderHeight + "px";
                item.style.overflowX = "auto";
            });
        }

        highlightParentItemOnActiveChild(detail) {
            /* Highlight the first menu item permanently enabled */
            if (this.container.children[0].dataset.linkHighlighted == "true")
                return;

            let dropdownInner = detail.children[1],
                activeChild = dropdownInner.querySelector(
                    ".list-menu__item--active"
                );

            if (activeChild)
                detail.parentElement.parentElement.classList.add(
                    "highlite_parent_item_on_active_child"
                );
            else
                detail.parentElement.parentElement.classList.remove(
                    "highlite_parent_item_on_active_child"
                );
        }

        disconnectedCallback() {
            this.overlay.removeEventListener(
                "mouseenter",
                this.removeOverlay.bind(this)
            );
            this.overlay.removeEventListener(
                "click",
                this.removeOverlay.bind(this)
            );

            this.detailsDisclosure?.forEach((detail) => {
                if (this.container.dataset?.activateMenu == "on_click") {
                    detail.removeEventListener(
                        "click",
                        this.activateTopLevelOnClick.bind(this)
                    );
                } else {
                    detail.removeEventListener(
                        "mouseenter",
                        this.activateTopLevelOnHover.bind(this)
                    );
                    detail.removeEventListener(
                        "mouseleave",
                        this.mouseLeave.bind(this)
                    );
                }
            });
        }
    }

    customElements.define("header-menu", HeaderMenu);
}

/* create custom event for better behavior on top level mouseover */
(function (mouseStopDelay) {
    var timeout;
    document.addEventListener("mouseover", function (e) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            var event = new CustomEvent("mousestop", {
                detail: {
                    clientX: e.clientX,
                    clientY: e.clientY,
                },
                bubbles: true,
                cancelable: true,
            });
            e.target.dispatchEvent(event);
        }, mouseStopDelay);
    });
})(150);
