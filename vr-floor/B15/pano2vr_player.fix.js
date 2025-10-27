/**
 * pano2vr_player.fix.js（延遲修正版）
 * ✅ 修補舊版 pano2vr_player.js 觸控在 iOS 無法拖曳的問題
 * 適用版本：pano2vr 5.0.x ～ 6.0.x
 * 作者：ChatGPT Custom Patch 2025-10
 */

(function () {
  console.log("🛠️ pano2vr_player 修補啟動中...");

  const waitForPano = () => {
    if (!window.pano || typeof pano.getPan !== "function") {
      return setTimeout(waitForPano, 500);
    }

    const container = pano.div ? pano.div : document.getElementById("container");
    if (!container) {
      console.warn("⚠️ 找不到 pano 容器");
      return;
    }

    console.log("✅ pano2vr player 準備完成，套用觸控修補");

    // 解除 pano2vr 原始的觸控限制
    container.style.touchAction = "pan-x pan-y";
    container.style.webkitUserSelect = "none";
    container.style.webkitTouchCallout = "none";
    container.ontouchmove = null;
    container.ontouchstart = null;
    container.ontouchend = null;

    // 綁定新的單指拖曳事件
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

        try {
          pano.setPan(pano.getPan() - dx * 0.25);
          pano.setTilt(pano.getTilt() - dy * 0.25);
        } catch (err) {
          console.warn("⚠️ pano 控制失敗：", err);
        }

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener("touchend", (e) => e.preventDefault(), { passive: false });

    console.log("🎉 pano2vr_player 修補完成，iOS 可單指拖曳");
  };

  // ⏳ 延遲 2 秒再啟動修補，確保 pano2vr 完成初始化
  window.addEventListener("load", () => setTimeout(waitForPano, 2000));
})();
