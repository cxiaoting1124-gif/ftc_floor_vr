/**
 * pano2vr_player.fix.js — PWA 專用正式版（Safari + iOS PWA）
 * ---------------------------------------------------------------
 * ✅ 改進重點：
 * - 延遲啟動：確保 pano2vr_player 初始化完成
 * - Safari 模式使用 TouchEvent
 * - PWA 模式使用 PointerEvent + MouseEvent 備援
 * - 全域阻止頁面滾動，避免事件被 WebKit 攔截
 * ---------------------------------------------------------------
 * 作者：ChatGPT Custom Patch 2025-10
 */

(function () {
  console.log("🛠️ pano2vr_player 修補啟動中...");

  const waitForPano = () => {
    if (!window.pano || typeof pano.getPan !== "function") {
      return setTimeout(waitForPano, 500);
    }

    const container = pano.div || document.getElementById("container");
    if (!container) {
      console.warn("⚠️ 找不到 pano 容器");
      return;
    }

    console.log("✅ pano2vr player 準備完成，套用觸控修補");

    // 🔒 防止 pano2vr 鎖定手勢
    Object.assign(container.style, {
      touchAction: "none",
      webkitUserSelect: "none",
      webkitTouchCallout: "none",
      overflow: "hidden",
      webkitOverflowScrolling: "auto",
    });

    // 🧠 偵測 PWA 模式
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    // 🧤 統一拖曳控制函式
    const createDragHandler = () => {
      let prevX = 0,
        prevY = 0,
        isDragging = false;

      const start = (x, y) => {
        isDragging = true;
        prevX = x;
        prevY = y;
      };

      const move = (x, y) => {
        if (!isDragging) return;
        const dx = x - prevX;
        const dy = y - prevY;
        pano.setPan(pano.getPan() - dx * 0.25);
        pano.setTilt(pano.getTilt() - dy * 0.25);
        prevX = x;
        prevY = y;
      };

      const end = () => (isDragging = false);

      // 📱 PointerEvent (PWA 模式)
      if (isStandalone && window.PointerEvent) {
        console.log("📱 使用 PointerEvent 拖曳控制 (PWA 模式)");
        container.addEventListener("pointerdown", (e) => start(e.clientX, e.clientY));
        container.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
        container.addEventListener("pointerup", end);
        container.addEventListener("pointercancel", end);
      }

      // 🧤 TouchEvent (Safari / Android)
      container.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 1) {
            start(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
          }
        },
        { passive: false }
      );

      container.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length === 1) {
            move(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
          }
        },
        { passive: false }
      );

      container.addEventListener(
        "touchend",
        (e) => {
          end();
          e.preventDefault();
        },
        { passive: false }
      );

      // 🖱️ MouseEvent (桌機 / Fallback)
      container.addEventListener("mousedown", (e) => start(e.clientX, e.clientY));
      container.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
      container.addEventListener("mouseup", end);

      console.log("🎉 pano2vr_player 修補完成（支援 Safari + PWA + 桌機 單指拖曳）");
    };

    createDragHandler();
  };

  // ⏳ 延遲啟動確保 pano2vr 初始化完成
  window.addEventListener("load", () => setTimeout(waitForPano, 2000));

  // 🛡️ 全域防止滾動（避免 PWA 吞事件）
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.target.id === "container") e.preventDefault();
    },
    { passive: false }
  );
})();
