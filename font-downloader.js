(function() {
  const OriginalFontFace = window.FontFace;
  const fontTracker = new Map();

  window.FontFace = function(family, source, descriptors) {
    const cleanFamily = family.replace(/['"]/g, '').trim();

    if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
      // Safely extract binary buffer
      let buffer = ArrayBuffer.isView(source) 
        ? source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength) 
        : source;

      // Track occurrence count for this font family
      const count = (fontTracker.get(cleanFamily) || 0) + 1;
      fontTracker.set(cleanFamily, count);

      // Determine file name based on load order
      let fileName;
      if (count === 1) {
        fileName = `${cleanFamily}.woff2`;
      } else if (count === 2) {
        fileName = `${cleanFamily}_subset.woff2`;
      } else {
        fileName = `${cleanFamily}_subset${count - 1}.woff2`;
      }

      console.log(`[Font Interceptor] Intercepted (#${count}): %c${fileName}%c (${(buffer.byteLength / 1024).toFixed(2)} KB)`, "color: #27ae60; font-weight: bold", "");

      // Trigger immediate download
      const blob = new Blob([buffer], { type: 'font/woff2' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    return descriptors 
      ? new OriginalFontFace(family, source, descriptors) 
      : new OriginalFontFace(family, source);
  };

  window.FontFace.prototype = OriginalFontFace.prototype;
  console.log('⚡ Interceptor Active: File #1 = FontName.woff2, File #2 = FontName_subset.woff2');
})();
