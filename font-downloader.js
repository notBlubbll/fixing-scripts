(function() {
  const OriginalFontFace = window.FontFace;
  const fontCounts = new Map();

  window.FontFace = function(family, source, descriptors) {
    const cleanFamily = family.replace(/['"]/g, '').trim();

    if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
      // Extract binary buffer safely
      let buffer;
      if (ArrayBuffer.isView(source)) {
        buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
      } else {
        buffer = source;
      }

      // Track occurrence count per font family name
      const count = (fontCounts.get(cleanFamily) || 0) + 1;
      fontCounts.set(cleanFamily, count);

      let ext = 'woff';
      let fileName = `${cleanFamily}.woff`;

      if (count === 2) {
        ext = 'woff2';
        fileName = `${cleanFamily}.woff2`;
      } else if (count > 2) {
        ext = 'woff2';
        fileName = `${cleanFamily}_${count}.woff2`;
      }

      console.log(`[Font Interceptor] Intercepted (#${count}): ${fileName} (${(buffer.byteLength / 1024).toFixed(2)} KB)`);

      const blob = new Blob([buffer], { type: `font/${ext}` });
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
  console.log('⚡ Interceptor Active: 1st load = .woff, 2nd load = .woff2');
})();
