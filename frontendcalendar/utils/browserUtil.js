const isSafariBrowser = (window) => {
    if (typeof window !== "undefined") {
        return /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
    }

    return false
}

module.exports = {
    isSafariBrowser: isSafariBrowser
}