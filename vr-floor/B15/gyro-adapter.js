/**
 * 🧭 Gyro Adapter for old Pano2VR (v5.x)
 * -------------------------------------
 * 功能：
 * - iOS / iPadOS 體感授權 (DeviceOrientationEvent.requestPermission)
 * - 監聽裝置方向 event，並轉換成 pano2vr yaw/pitch
 * - 相容舊版 player：無需更換 pano2vr_player.js
 */

(function () {
  let pano;
  let lastAlpha = null, lastBeta = null, lastGamma = null;
  let enabled = false;

  // 綁定 pano player
  function bindPano(playerInstance) {
    pano = playerInstance;
  }

  // 啟動體感監聽
  function startGyro() {
    if (!window.DeviceOrientationEvent) {
      alert("此裝置不支援 DeviceOrientationEvent");
      return;
    }

    const handler = (event) => {
      if (!enabled || !pano) return;

      const { alpha, beta, gamma } = event;
      if (alpha == null) return;

      if (lastAlpha == null) {
        lastAlpha = alpha;
        lastBeta = beta;
        lastGamma = gamma;
      }

      const deltaYaw = (alpha - lastAlpha) * 0.5;   // 左右
      const deltaPitch = (beta - lastBeta) * 0.5;  // 上下

      const newPan = pano.getPan() - deltaYaw;
      const newTilt = pano.getTilt() - deltaPitch;

      pano.setPan(newPan);
      pano.setTilt(newTilt);

      lastAlpha = alpha;
      lastBeta = beta;
      lastGamma = gamma;
    };

    window.addEventListener("deviceorientation", handler, true);
    enabled = true;
    console.log("✅ Gyro adapter started");
  }

  // 手動授權 + 啟動
  function enableGyroAdapter(playerInstance) {
    bindPano(playerInstance);

    const request = () => {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((res) => {
            if (res === "granted") {
              startGyro();
            } else {
              alert("❌ 使用者拒絕體感權限");
            }
          })
          .catch((err) => alert("授權錯誤：" + err));
      } else {
        startGyro(); // Android / 桌機
      }
    };

    request();
  }

  // 對外暴露全域函式
  window.gyroAdapter = {
    enable: enableGyroAdapter
  };
})();
