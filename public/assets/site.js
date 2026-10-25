const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("#search-results");
const menuToggle = document.querySelector("#menu-toggle");
const sidebar = document.querySelector("#sidebar");
const overlay = document.querySelector("#sidebar-overlay");
const themeToggle = document.querySelector("#theme-toggle");
const scrollTop = document.querySelector("#scroll-top");

function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
    const open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("visible", open);
    menuToggle.setAttribute("aria-expanded", String(open));
});
overlay.addEventListener("click", closeMenu);
sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.dataset.theme = localStorage.getItem("hol-theme") || preferred;
themeToggle.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("hol-theme", theme);
    themeToggle.setAttribute("aria-label", theme === "dark" ? "切换浅色主题" : "切换深色主题");
});

function renderSearch(query) {
    const value = query.trim().toLocaleLowerCase();
    searchResults.replaceChildren();
    if (!value) {
        searchResults.classList.remove("visible");
        return;
    }
    const matches = window.HOL_PAGES
        .filter(page => `${page.title} ${page.text}`.toLocaleLowerCase().includes(value))
        .slice(0, 8);
    if (!matches.length) {
        const empty = document.createElement("span");
        empty.className = "search-empty";
        empty.textContent = "没有匹配的课程内容";
        searchResults.append(empty);
    } else {
        for (const page of matches) {
            const link = document.createElement("a");
            link.href = page.href;
            link.textContent = page.title;
            const detail = document.createElement("small");
            detail.textContent = page.summary;
            link.append(detail);
            searchResults.append(link);
        }
    }
    searchResults.classList.add("visible");
}

searchInput.addEventListener("input", () => renderSearch(searchInput.value));
searchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        searchInput.value = "";
        searchResults.classList.remove("visible");
    }
});
document.addEventListener("click", event => {
    if (!event.target.closest(".search-shell")) searchResults.classList.remove("visible");
});

const tocLinks = [...document.querySelectorAll(".article-toc-link")];
if ("IntersectionObserver" in window && tocLinks.length) {
    const byId = new Map(tocLinks.map(link => [decodeURIComponent(link.hash.slice(1)), link]));
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => link.classList.remove("active"));
                byId.get(entry.target.id)?.classList.add("active");
            }
        }
    }, { rootMargin: "-15% 0px -75% 0px" });
    document.querySelectorAll(".article h2[id], .article h3[id]").forEach(heading => observer.observe(heading));
}

function updateScrollButton() {
    scrollTop.classList.toggle("visible", window.scrollY > 500);
}
window.addEventListener("scroll", updateScrollButton, { passive: true });
updateScrollButton();
scrollTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
