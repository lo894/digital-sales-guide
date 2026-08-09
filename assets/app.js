/* 数码销售新手指南 · 渲染逻辑（数据驱动，哈希路由） */
(function () {
  "use strict";

  var LESSONS = window.LESSONS || [];
  var app = document.getElementById("app");
  var topbar = document.getElementById("topbar");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 把 \n 变成 <br>
  function multiline(s) {
    return esc(s).replace(/\n/g, "<br>");
  }

  function lessonById(id) {
    for (var i = 0; i < LESSONS.length; i++) {
      if (LESSONS[i].id === id) return LESSONS[i];
    }
    return null;
  }

  // 卡片 / 详情页的角标：课程显示“第 N 课”，制度显示“内部制度”
  function badgeOf(l) {
    if (l.kind === "policy") return "内部制度";
    return "第 " + (l.no || "?") + " 课";
  }

  /* ---------- 区块渲染 ---------- */
  function renderBlock(b, ctx) {
    switch (b.type) {
      case "lead":
        return '<p class="lead">' + multiline(b.text) + "</p>";

      case "p":
        return '<p class="para">' + multiline(b.text) + "</p>";

      case "note":
        return '<p class="note">' + multiline(b.text) + "</p>";

      case "cards":
        var cards = (b.items || [])
          .map(function (it) {
            return (
              '<div class="card">' +
              '<div class="card-name">' + esc(it.name) + "</div>" +
              '<div class="card-desc">' + esc(it.desc) + "</div>" +
              "</div>"
            );
          })
          .join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<div class="cards">' + cards + "</div>"
        );

      case "steps":
        var steps = (b.items || [])
          .map(function (it, i) {
            return (
              '<li class="step">' +
              '<span class="step-no">' + (i + 1) + "</span>" +
              '<div class="step-body"><div class="step-title">' + esc(it.title) + "</div>" +
              (it.desc ? '<div class="step-desc">' + esc(it.desc) + "</div>" : "") +
              "</div></li>"
            );
          })
          .join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<ol class="steps">' + steps + "</ol>"
        );

      case "stages":
        var stages = (b.items || [])
          .map(function (it) {
            var pts = (it.points || [])
              .map(function (p) { return "<li>" + esc(p) + "</li>"; })
              .join("");
            return (
              '<div class="stage">' +
              '<div class="stage-name">' + esc(it.name) + "</div>" +
              '<ul class="stage-points">' + pts + "</ul>" +
              "</div>"
            );
          })
          .join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<div class="stages">' + stages + "</div>"
        );

      case "levels":
        var lv = (b.items || []).map(function (it) {
          var cond = (it.condition || []).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
          var ben = (it.benefits || []).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
          return (
            '<div class="level-card">' +
            '<div class="level-head">' +
            '<span class="level-badge">' + esc(it.level) + "</span>" +
            '<div class="level-name">' + esc(it.name) + "</div>" +
            (it.rate ? '<div class="level-rate">' + esc(it.rate) + "</div>" : "") +
            "</div>" +
            '<div class="level-section"><div class="level-label">达成条件</div><ul class="level-list">' + cond + "</ul></div>" +
            '<div class="level-section"><div class="level-label">福利</div><ul class="level-list">' + ben + "</ul></div>" +
            "</div>"
          );
        }).join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<div class="levels">' + lv + "</div>"
        );

      case "list":
        var lis = (b.items || [])
          .map(function (it) { return "<li>" + esc(it) + "</li>"; })
          .join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<ul class="bullet-list">' + lis + "</ul>"
        );

      case "faq":
        var faqs = (b.items || [])
          .map(function (it) {
            return (
              '<div class="faq-item">' +
              '<div class="faq-q"><span class="q-tag">问</span>' + esc(it.q) + "</div>" +
              '<div class="faq-a"><span class="a-tag">答</span>' + esc(it.a) + "</div>" +
              "</div>"
            );
          })
          .join("");
        return (
          (b.title ? '<h3 class="block-title">' + esc(b.title) + "</h3>" : "") +
          '<div class="faq">' + faqs + "</div>"
        );

      case "callout":
        var tone = b.tone || "tip";
        var icon = tone === "warn" ? "!" : tone === "good" ? "✓" : "i";
        return (
          '<div class="callout callout-' + esc(tone) + '">' +
          '<div class="callout-icon">' + icon + "</div>" +
          '<div class="callout-body">' +
          (b.title ? '<div class="callout-title">' + esc(b.title) + "</div>" : "") +
          '<div class="callout-text">' + esc(b.body) + "</div>" +
          "</div></div>"
        );

      default:
        return "";
    }
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    topbar.style.display = "flex";
    var totalChapters = LESSONS.reduce(function (s, l) {
      return s + (l.chapters ? l.chapters.length : 0);
    }, 0);

    var hero =
      '<header class="hero">' +
      '<div class="hero-inner">' +
      '<span class="pill">持续更新中 · 已收录 ' + LESSONS.length + " 篇</span>" +
      '<h1 class="hero-title">数码销售<br>新手实战指南</h1>' +
      '<p class="hero-sub">从台式电脑到提成晋升，把销售要懂的都攒在这里。每多一份资料，就多一篇可随时翻看的笔记。</p>' +
      '<div class="hero-stats">' +
      '<div class="stat"><b>' + LESSONS.length + "</b><span>篇内容</span></div>" +
      '<div class="stat"><b>' + totalChapters + "</b><span>个章节</span></div>" +
      '<div class="stat"><b>随时</b><span>翻看</span></div>' +
      "</div>" +
      "</div>" +
      "</header>";

    var grid = LESSONS.map(function (l, i) {
      var meta = [];
      if (l.date) meta.push(l.date);
      if (l.subtitle) meta.push(l.subtitle);
      return (
        '<a class="lesson-card" href="#/lesson/' + esc(l.id) + '">' +
        '<div class="lesson-no">' + badgeOf(l) + "</div>" +
        '<h2 class="lesson-title">' + esc(l.title) + "</h2>" +
        (l.summary ? '<p class="lesson-summary">' + esc(l.summary) + "</p>" : "") +
        (meta.length ? '<div class="lesson-meta">' + esc(meta.join(" · ")) + "</div>" : "") +
        '<div class="lesson-go">查看 →</div>' +
        "</a>"
      );
    }).join("");

    app.innerHTML =
      hero +
      '<main class="container"><section class="section">' +
      '<h2 class="section-title">全部笔记</h2>' +
      '<div class="lesson-grid">' + grid + "</div>" +
      "</section></main>" +
      footer();

    window.scrollTo(0, 0);
  }

  /* ---------- 详情页 ---------- */
  function renderLesson(id) {
    var l = lessonById(id);
    if (!l) { renderHome(); return; }
    topbar.style.display = "flex";

    var toc = (l.chapters || [])
      .map(function (c, i) {
        return (
          '<li><a href="#ch-' + i + '" data-toc="' + i + '">' +
          esc(c.title.replace(/^[一二三四五六七八九十]+、/, "")) + "</a></li>"
        );
      })
      .join("");

    var chapters = (l.chapters || [])
      .map(function (c, i) {
        var blocks = (c.blocks || [])
          .map(function (b) { return renderBlock(b, { lesson: l, chapter: i }); })
          .join("");
        return (
          '<section class="chapter" id="ch-' + i + '">' +
          '<h2 class="chapter-title">' + esc(c.title) + "</h2>" +
          blocks +
          "</section>"
        );
      })
      .join("");

    var meta = [];
    if (l.date) meta.push(l.date);
    if (l.subtitle) meta.push(l.subtitle);

    app.innerHTML =
      '<div class="detail">' +
      '<div class="container detail-top">' +
      '<a class="back" href="#/">← 返回笔记列表</a>' +
      '<span class="pill">' + badgeOf(l) + "</span>" +
      '<h1 class="detail-title">' + esc(l.title) + "</h1>" +
      (meta.length ? '<div class="detail-meta">' + esc(meta.join(" · ")) + "</div>" : "") +
      (l.summary ? '<p class="detail-summary">' + esc(l.summary) + "</p>" : "") +
      "</div>" +
      '<div class="container detail-body">' +
      '<aside class="toc"><div class="toc-title">本章目录</div><ul>' + toc + "</ul></aside>" +
      '<div class="chapters">' + chapters + "</div>" +
      "</div>" +
      "</div>" +
      footer();

    bindToc();
    window.scrollTo(0, 0);
  }

  function bindToc() {
    var links = app.querySelectorAll("[data-toc]");
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var i = a.getAttribute("data-toc");
        var el = document.getElementById("ch-" + i);
        if (el) {
          var y = el.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      });
    });
  }

  function footer() {
    return (
      '<footer class="footer">' +
      '<div>由 L.大王 的 AI 搭子整理 · 持续更新</div>' +
      '<div class="footer-sub">每多一份资料，就在这里多留一笔。</div>' +
      "</footer>"
    );
  }

  /* ---------- 路由 ---------- */
  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/lesson\/(.+)$/);
    if (m) renderLesson(decodeURIComponent(m[1]));
    else renderHome();
  }

  window.addEventListener("hashchange", route);
  route();
})();
