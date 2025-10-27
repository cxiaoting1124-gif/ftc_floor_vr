/**
 * ✅ pano2vr iOS 單指拖曳修正補丁（for pano2vr_player.js v5.x）
 * 目的：修復 iOS Safari / PWA 中無法拖曳的問題
 * 作者：ChatGPT 修正版 2025-10
 */
(function () {
  const container = document.getElementById("container");
  let panoReady = false;
  let startX = 0, startY = 0;

  /** 👇 延遲確保 pano2vr player 初始化完成 */
  const initFix = () => {
    if (!window.pano || typeof pano.setPan !== "function") {
      // 還沒初始化好，再等一下
      return setTimeout(initFix, 500);
    }

    panoReady = true;
    console.log("✅ touch-fix 啟動：pano2vr player 已就緒");

    // 關鍵：阻止 iOS 攔截觸控事件
    container.style.touchAction = "none";
    container.ontouchstart = null;
    container.ontouchmove = null;
    container.ontouchend = null;

    // 強制移除 pano2vr 預設 listener（它會吃掉單指事件）
    const clone = container.cloneNode(true);
    container.parentNode.replaceChild(clone, container);

    // 重新綁定觸控事件（非 passive）
    clone.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          e.preventDefault();
        }
      },
      { passive: false }
    );

    clone.addEventListener(
      "touchmove",
      (e) => {
        if (!panoReady || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (typeof pano.setPan === "function" && typeof pano.setTilt === "function") {
          pano.setPan(pano.getPan() - dx * 0.2);
          pano.setTilt(pano.getTilt() - dy * 0.2);
        }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault();
      },
      { passive: false }
    );

    clone.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  };

  // 等 pano2vr player 初始化後執行修正
  window.addEventListener("load", () => setTimeout(initFix, 800));
})();
