if (!customElements.get("blogs-filter")) {
    class BlogsFiltering extends HTMLElement {
        constructor() {
            super();

            this.tags = this.querySelector('[data-filter="tags"]');
            this.blogs = document.querySelectorAll(
                '[data-blogs="main-blogs"] article'
            );

            if (!this.tags.length || !this.blogs.length) return;
        }

        connectedCallback() {
            let tag,
                tags = this.tags.children;
            [...tags]?.forEach((tag) => {
                tag.addEventListener("click", this.onTagClick.bind(this));
            });
        }

        onTagClick(e) {
            e.preventDefault();

            let currentTag = e.target,
                tagTitle =
                    currentTag.textContent.trim().toLowerCase() ||
                    currentTag.innerText.trim().toLowerCase(),
                articles = this.blogs,
                articleTag,
                blogsTag;

            for (blogsTag of this.tags.children) {
                blogsTag.classList.remove("active");
            }

            if (!currentTag.parentNode.classList.contains("active"))
                currentTag.parentNode.classList.add("active");

            articles.forEach((article) => {
                articleTag = article.dataset?.articleTag;

                if (articleTag && articleTag.indexOf(tagTitle) == -1)
                    article.style.display = "none";
                else article.style.display = "initial";

                if (currentTag.parentNode.classList.contains("all"))
                    article.style.display = "initial";
            });
        }
    }

    customElements.define("blogs-filter", BlogsFiltering);
}
