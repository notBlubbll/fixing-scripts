(function() {
    // 1. Grab the pure, uncorrupted native setters before we overwrite anything
    const nativeVolumeSet = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume').set;
    const nativeMutedSet = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set;

    // 2. Create the inescapable volume lock (Always 1)
    const volumeLock = {
        get: () => 1,
        set: function(val) { 
            nativeVolumeSet.call(this, 1); // Force hardware volume to 1
        },
        configurable: false, // Cannot be undone
        enumerable: true
    };

    // 3. Create the inescapable un-mute lock (Always false)
    const mutedLock = {
        get: () => false,
        set: function(val) { 
            nativeMutedSet.call(this, false); // Force unmuted
        },
        configurable: false, 
        enumerable: true
    };

    // 4. Carpet-bomb the entire prototype chain
    const prototypes = [
        HTMLMediaElement.prototype, 
        HTMLVideoElement.prototype, 
        HTMLAudioElement.prototype
    ];

    prototypes.forEach(proto => {
        try { Object.defineProperty(proto, 'volume', volumeLock); } catch(e) {}
        try { Object.defineProperty(proto, 'muted', mutedLock); } catch(e) {}
    });
})();
