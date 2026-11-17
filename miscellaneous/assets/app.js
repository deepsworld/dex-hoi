"use strict";

const videos = [...document.querySelectorAll("video")];
const pause = items => items.forEach(video => video.pause());
document.querySelector("#pause-all")?.addEventListener("click", () => pause(videos));
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(videos); });

// Compare pairs or complete method rows from the beginning, without altering playback speed.
document.querySelectorAll("[data-play-group]").forEach(button => {
  button.addEventListener("click", async () => {
    const group = document.getElementById(button.dataset.playGroup);
    const players = [...group.querySelectorAll("video:not([data-review-preview])")];
    pause(videos);
    players.forEach(video => { video.currentTime = 0; video.playbackRate = 1; });
    button.disabled = true;
    try { await Promise.all(players.map(video => video.play())); }
    catch (error) { group.querySelector("[data-play-status]").textContent = "Use the individual video controls to play."; }
    finally { button.disabled = false; }
  });
});
document.querySelectorAll("[data-pause-group]").forEach(button => {
  button.addEventListener("click", () => pause([...document.getElementById(button.dataset.pauseGroup).querySelectorAll("video")]));
});

// All cards remain in the HTML, so native video playback also works without JavaScript.
const cards = [...document.querySelectorAll("[data-filter-card]")];
const filters = [...document.querySelectorAll("[data-filter]")];
const objectFilters = [...document.querySelectorAll("[data-object-filter]")];
const search = document.querySelector("#search");
let category = "all";
let objectGroup = "all";
function filterCards() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  cards.forEach(card => {
    const visible = (category === "all" || card.dataset.category === category)
      && (objectGroup === "all" || card.dataset.object === objectGroup)
      && card.textContent.toLowerCase().includes(query);
    card.hidden = !visible;
    if (visible) count++;
    else pause([...card.querySelectorAll("video")]);
  });
  document.querySelector("#count").textContent = `${count} of ${cards.length} tasks`;
  document.querySelector("#empty").hidden = count !== 0;
  document.querySelectorAll("[data-object-section]").forEach(section => {
    section.hidden = !section.querySelector("[data-filter-card]:not([hidden])");
  });
}
if (cards.length) {
  filters.forEach(button => button.addEventListener("click", () => {
    category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
    objectGroup = "all";
    objectFilters.forEach(filter => {
      filter.hidden = category !== "all" && filter.dataset.objectFilter !== "all" && filter.dataset.category !== category;
      filter.setAttribute("aria-pressed", String(filter.dataset.objectFilter === "all"));
    });
    filterCards();
  }));
  objectFilters.forEach(button => button.addEventListener("click", () => {
    objectGroup = button.dataset.objectFilter;
    objectFilters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
    filterCards();
  }));
  search.addEventListener("input", filterCards);
}
