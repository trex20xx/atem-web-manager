// =========================================================================
// ATEM WEB MANAGER - SNAPSHOT ENGINE (v1.75)
// =========================================================================

export const takeSnapshot = (videoEl, customOverlayImg, wipeState) => {
    const { clipV, clipH, revV, revH, opacity } = wipeState;

    const canvas = document.createElement('canvas');
    canvas.width = 1920; 
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Draw Video Frame
    if (videoEl && videoEl.readyState >= 2) {
        try {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Calculate Wipe Math for Overlay
    let tCrop = revV ? 0 : (clipV / 100) * canvas.height;
    let bCrop = revV ? (clipV / 100) * canvas.height : 0;
    let lCrop = revH ? 0 : (clipH / 100) * canvas.width;
    let rCrop = revH ? (clipH / 100) * canvas.width : 0;
    
    let drawX = lCrop;
    let drawY = tCrop;
    let drawW = canvas.width - lCrop - rCrop;
    let drawH = canvas.height - tCrop - bCrop;
    
    if (drawW > 0 && drawH > 0 && customOverlayImg && customOverlayImg.src) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(drawX, drawY, drawW, drawH);
        ctx.clip();
        
        ctx.globalAlpha = parseFloat(opacity) / 100;
        ctx.drawImage(customOverlayImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    const link = document.createElement('a');
    link.download = 'atem-snapshot-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
};