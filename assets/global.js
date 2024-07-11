function fetchLoaderHTML() {
    return Promise.all([
        document.getElementById("template-loading-overlay")?.innerHTML,
    ]).then((results) => results[0]);
}

function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
        )
    );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
    var elements = getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = (event) => {
        if (
            event.target !== container &&
            event.target !== last &&
            event.target !== first
        )
            return;

        document.addEventListener("keydown", trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function () {
        document.removeEventListener("keydown", trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function (event) {
        if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
            event.preventDefault();
            first.focus();
        }

        //  On the first focusable element and tab backward, focus the last element.
        if (
            (event.target === container || event.target === first) &&
            event.shiftKey
        ) {
            event.preventDefault();
            last.focus();
        }
    };

    document.addEventListener("focusout", trapFocusHandlers.focusout);
    document.addEventListener("focusin", trapFocusHandlers.focusin);

    elementToFocus?.focus();
}

function pauseAllMedia() {
    document.querySelectorAll(".js-youtube").forEach((video) => {
        video.contentWindow.postMessage(
            '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
            "*"
        );
    });
    document.querySelectorAll(".js-vimeo").forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', "*");
    });
    document.querySelectorAll("video").forEach((video) => video.pause());
    document
        .querySelectorAll("product-model")
        .forEach((model) => model.modelViewerUI?.pause());
}

function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener("focusin", trapFocusHandlers.focusin);
    document.removeEventListener("focusout", trapFocusHandlers.focusout);
    document.removeEventListener("keydown", trapFocusHandlers.keydown);

    if (elementToFocus) elementToFocus.focus();
}

const serializeForm = (form) => {
    const obj = {};
    const formData = new FormData(form);
    for (const key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: `application/${type}`,
        },
    };
}

function createFromTemplate(templateId) {
    return document
        .getElementById(templateId)
        .content.firstElementChild.cloneNode(true);
}

function publish(eventName, data) {
    if (subscribers[eventName]) {
        subscribers[eventName].forEach((callback) => {
            callback(data);
        });
    }
}
/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
    window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
    return function () {
        return fn.apply(scope, arguments);
    };
};

Shopify.setSelectorByValue = function (selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
        var option = selector.options[i];
        if (value == option.value || value == option.innerHTML) {
            selector.selectedIndex = i;
            return i;
        }
    }
};

Shopify.addListener = function (target, eventName, callback) {
    target.addEventListener
        ? target.addEventListener(eventName, callback, false)
        : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
    options = options || {};
    var method = options["method"] || "post";
    var params = options["parameters"] || {};

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);
        form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
    country_domid,
    province_domid,
    options
) {
    this.countryEl = document.getElementById(country_domid);
    this.provinceEl = document.getElementById(province_domid);
    this.provinceContainer = document.getElementById(
        options["hideElement"] || province_domid
    );

    Shopify.addListener(
        this.countryEl,
        "change",
        Shopify.bind(this.countryHandler, this)
    );

    this.initCountry();
    this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
    initCountry: function () {
        var value = this.countryEl.getAttribute("data-default");
        Shopify.setSelectorByValue(this.countryEl, value);
        this.countryHandler();
    },

    initProvince: function () {
        var value = this.provinceEl.getAttribute("data-default");
        if (value && this.provinceEl.options.length > 0) {
            Shopify.setSelectorByValue(this.provinceEl, value);
        }
    },

    countryHandler: function (e) {
        var opt = this.countryEl.options[this.countryEl.selectedIndex];
        var raw = opt.getAttribute("data-provinces");
        var provinces = JSON.parse(raw);

        this.clearOptions(this.provinceEl);
        if (provinces && provinces.length == 0) {
            this.provinceContainer.style.display = "none";
        } else {
            for (var i = 0; i < provinces.length; i++) {
                var opt = document.createElement("option");
                opt.value = provinces[i][0];
                opt.innerHTML = provinces[i][1];
                this.provinceEl.appendChild(opt);
            }

            this.provinceContainer.style.display = "";
        }
    },

    clearOptions: function (selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    },

    setOptions: function (selector, values) {
        for (var i = 0, count = values.length; i < values.length; i++) {
            var opt = document.createElement("option");
            opt.value = values[i];
            opt.innerHTML = values[i];
            selector.appendChild(opt);
        }
    },
};

class ModalDialog extends HTMLElement {
    constructor() {
        super();
        this.querySelector('[id^="ModalClose-"]').addEventListener(
            "click",
            this.hide.bind(this)
        );
        this.addEventListener("click", (event) => {
            if (event.target.nodeName === "MODAL-DIALOG") this.hide();
        });
        this.addEventListener("keyup", () => {
            if (event.code?.toUpperCase() === "ESCAPE") this.hide();
        });
    }

    show(opener) {
        this.openedBy = opener;
        this.setAttribute("open", "");
        this.querySelector(".template-popup")?.loadContent();
        trapFocus(this, this.querySelector('[role="dialog"]'));
    }

    hide() {
        this.removeAttribute("open");
        removeTrapFocus(this.openedBy);
        window.pauseAllMedia();
    }
}
customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
    constructor() {
        super();

        const button = this.querySelector("button");
        button?.addEventListener("click", () => {
            document
                .querySelector(this.getAttribute("data-modal"))
                ?.show(button);
        });
    }
}
customElements.define("modal-opener", ModalOpener);

/* slide-text animation */
(() => {
    let arrElements = [],
        textAnimate = document.querySelectorAll(".text-animation");
    const marginBottom = 100;

    if (!textAnimate.length) return;

    textAnimate.forEach((elem) => {
        if (elem.classList.contains("slider")) return;

        let titles = elem.querySelectorAll(".title") || "",
            texts = elem.querySelectorAll("p") || "",
            buttons = elem.querySelectorAll(".action") || "";

        arrElements.push(titles, texts, buttons);
    });

    arrElements.forEach((item) => {
        if (item.length == 0 || window.innerWidth < 760) return;

        item.forEach((el) => {
            toggleAnimation(el);
            window.addEventListener("scroll", (e) => toggleAnimation(el));
        });
    });

    function toggleAnimation(item) {
        if (item) {
            if (
                window.innerHeight -
                    item.getBoundingClientRect().top -
                    marginBottom >
                0
            ) {
                item.classList.add("slide-top");
            } else {
                item.classList.remove("slide-top");
            }
        }
    }
})();

(() => {
    let innerWidth = window.innerWidth;

    window.addEventListener(
        "resize",
        debounce(() => {
            if (innerWidth !== window.innerWidth) {
                innerWidth = window.innerWidth;
                publish(PUB_SUB_EVENTS.windowResizeX, undefined);
            }
        }, 200)
    );
})();
