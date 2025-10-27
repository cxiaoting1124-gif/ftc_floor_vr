/**
 * pano2vr 手機觸控補丁 for iOS WebKit
 * 適用 pano2vr 5.0.2 以下版本
 */
(function(){
  let startX, startY;
  const container = document.getElementById("container");

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
      if (window.pano && typeof pano.setPan === "function" && typeof pano.setTilt === "function") {
        pano.setPan(pano.getPan() - dx * 0.2);
        pano.setTilt(pano.getTilt() - dy * 0.2);
      }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      e.preventDefault();
    }
  }, { passive: false });
})();
