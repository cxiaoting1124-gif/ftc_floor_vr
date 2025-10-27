/**
 * pano2vr_player.fix.js — 最終正式版（支援 iOS Safari + PWA）
 * ---------------------------------------------------------------
 * 🧩 功能：
 * - 修補舊版 pano2vr_player.js 讓 iOS 能單指拖曳
 * - Safari 模式下使用 TouchEvent
 * - PWA 模式下自動切換為 PointerEvent（iOS 17 起）
 * - 延遲執行確保 pano2vr 初始化完成
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

    // 🔒 防止舊 pano2vr 限制觸控
    container.style.touchAction = "none";
    container.style.webkitUserSelect = "none";
    container.style.webkitTouchCallout = "none";

    // 🧠 判斷目前是否為 PWA 模式
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone && window.PointerEvent) {
      // ------------------------------------------------
      // 📱 PWA 模式使用 PointerEvent（iOS 17 以上）
      // ------------------------------------------------
      console.log("📱 偵測到 PWA 模式，使用 PointerEvent 拖曳控制");

      let prevX = 0, prevY = 0, isDragging = false;

      container.addEventListener("pointerdown", (e) => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
        container.setPointerCapture(e.pointerId);
      });

      container.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        pano.setPan(pano.getPan() - dx * 0.25);
        pano.setTilt(pano.getTilt() - dy * 0.25);
        prevX = e.clientX;
        prevY = e.clientY;
      });

      container.addEventListener("pointerup", () => (isDragging = false));
      container.addEventListener("pointercancel", () => (isDragging = false));
    } else {
      // ------------------------------------------------
      // 🧤 Safari / 一般瀏覽器：使用 TouchEvent
      // ------------------------------------------------
      let startX = 0, startY = 0;

      container.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          e.preventDefault();
        }
      }, { passive: false });

      container.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) {
          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;
          pano.setPan(pano.getPan() - dx * 0.25);
          pano.setTilt(pano.getTilt() - dy * 0.25);
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          e.preventDefault();
        }
      }, { passive: false });

      container.addEventListener("touchend", (e) => e.preventDefault(), { passive: false });
    }

    console.log("🎉 pano2vr_player 修補完成（支援 Safari + PWA 單指拖曳）");
  };

  // ⏳ 延遲啟動確保 pano2vr 初始化完成
  window.addEventListener("load", () => setTimeout(waitForPano, 2000));
})();
