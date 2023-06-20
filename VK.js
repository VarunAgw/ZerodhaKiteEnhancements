// ********************************************************************************
// *
// * VK.js by Varun Agrawal (https://Varunagw.com/)
// * Version: v2021.4.13
// *
// *********************************************************************************

VK = {};

VK.waitUntilMore = function (selectors, callback, interval) {
    let operationUuid = "TM_" + VK.uuidv1();
    interval = interval || 50;

    console.log(selectors, operationUuid, interval);
    (function () {
        let $new_elements = $(selectors).not(`.${operationUuid}`);
        $new_elements.addClass(operationUuid);
        $new_elements.each(function (index) {
            callback.apply(this, [selectors, this]);
        });
        setTimeout(arguments.callee, interval);
    })();
};

VK.uuidv1 = function () {
    return VK.uuidv4().substr(0, 8);
}

VK.uuidv4 = function () {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

VK.addStyle = function (code) {
    $("<style rel='stylesheet' type='text/css'>").text(code).appendTo("html");
};

VK.asyncDelay = async function (ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

VK.copyToClipboard = function (text) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

/**
 * Parse URL to simple JSON structure
 * @param {String} url URL to parse (skip it to parse document.location)
 * @return {parseURL.o}
 */
VK.parseURL = function (url) {
    if (typeof url === "undefined") {
        if (typeof document === "undefined") {
            url = "https://example.com/a/b?c=d&e=f#g"
        } else {
            url = document.location.href;
        }
    } else if (typeof url === "object") {
        url = url.href;
    }

    let originalUrl = url;

    if (url.match(/^\w+:\/\//) === null) {
        // Missing protocol
        if (url.match(/\w:\\/) !== null) {
            url = "file://" + "/" + url.replaceAll("\\", "/");
        }
    }

    let matches = url.match(/^([\w-]+?):\/{2,3}(?:(\w+?):(\w+?)@)?([^/^:]+?)?(?::(\d+))?(?:(\/[^?^#]*?)(?:\?([^#]*?))?(?:\#(.*))?)?$/);
    if (matches == null) {
        throw `Invalid URL supplied to parseURL: ${url}`;
    }

    let o = {};
    o.protocol = matches[1];                                       // http https
    o.username = (matches[2] === undefined ? "" : matches[2]);                                       // username
    o.password = (matches[3] === undefined ? "" : matches[3]);                                       // password
    o.hostname = (matches[4] === undefined ? "" : matches[4]);     // mail.google.com mail.varunagw.com
    o.port = matches[5];                                       // 80 4521
    o.pathname = (matches[6] === undefined ? "/" : matches[6]);    // /mail/a/b/ /mail/a/b/c
    o.args = (matches[7] === undefined ? "" : matches[7]);     // s=a&ds=dsda&dds=vvv ?s&=a&ds=dsda&dds=vvv& ""
    o.hash = (matches[8] === undefined ? "" : matches[8]);     // dsadas ""

    o.host = o.hostname.split(".");
    o.hostrev = o.host.slice(0).reverse();
    o.hostlen = o.host.length;

    o.path = o.pathname.substr(1).split("/");
    o.pathrev = o.path.slice(0).reverse();
    o.pathlen = o.path.length;
    o.pathnow = o.pathrev[0];

    o.filename = o.pathnow.split(".");
    o.extension = ((o.filename.length === 1 || o.filename.slice(-1)[0].match(/%20| /) !== null) ? "" : o.filename.pop());
    o.filename = o.filename.join(".");

    o.argname = o.args.replace(/^&+|&+$/, "");
    o.arglen = o.argname.split("&").length;
    o.arg = {};
    o.argE = {};

    o.argname.split("&").forEach(function (value) {
        if ("" === value) {
            return;
        }
        let key = value.split("=")[0];
        o.argE[key] = (key === value ? undefined : value.substr(key.length + 1));
        o.arg[key] = (key === value ? undefined : decodeURIComponent(o.argE[key]).replace(/\+/g, " "));
    });

    o.toString = function () {
        return o.protocol + "://"
            + (o.username.length > 0 ? o.username + (o.password.length > 0 ? ":" + o.password : "") + "@" : "")
            + o.hostname
            + (o.port !== undefined ? ":" + o.port : "")
            + o.pathname
            + (o.args.length > 0 ? "?" + o.args : "")
            + (o.hash.length > 0 ? "#" + o.hash : "")
    };

    o.href = o.toString();                                     // https://mail.google.com/mail/u/0/h/pis4p85m83kp/?s=a&ds=dsda&dds=vvv&#dsadas

    if (VK.DEBUG == true && o.href !== originalUrl) {
        console.error(`Failed while parsing URL\n${originalUrl}\n${o.href}`);
        console.error(o);
    }
    return o;
}

VK.waitUntilExists = function (selectors, callback, timeout) {
    if (timeout === undefined) {
        timeout = 2000;
    }

    let time = new Date().getTime();
    (function () {
        if ($(selectors).length > 0) {
            callback.apply($(selectors).get(), [selectors]);
        } else {
            if (timeout === 0 || new Date().getTime() - time < timeout) {
                window.setTimeout(arguments.callee, 50);
            }
        }
    })();
};

$.fn.val2 = function (value) {
    const el = this[0];
    const lastValue = el.value;
    el.value = value;
    const event = new Event("input", {bubbles: true});
    event.simulated = true;

    try {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(el, value);
    } catch (e) {
        console.log(e);
        // Happens sometime
    }

    try {
        const tracker = el._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
    } catch (e) {
        console.log(e);
        // Also, happens sometime
    }

    try {
        el.dispatchEvent(event);
    } catch (e) {
        console.log(e);
        // Also, happens sometime
    }
};

$.fn.click2 = function () {
    const el = this[0];
    const event = new Event("click", {bubbles: true});
    event.simulated = true;

    try {
        el.dispatchEvent(event);
    } catch (e) {
        console.log(e);
        // Also, happens sometime
    }
};

VK.URL = VK.parseURL();