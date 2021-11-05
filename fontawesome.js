(function(libs, callback) {
    var load = 0;
    libs.forEach(function(url) {
        var a = document.createElement('script');
        a.src = url;
        a.addEventListener('load', function() {
            load++;
            if (load == libs.length) {
                callback();
            }
        });
        document.body.appendChild(a);
    });
})(['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js', 'https://cdn.jsdelivr.net/g/filesaver.js', 'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautifier.min.js'], function() {
    var fontawesome_pro_url = document.querySelector('link[href$="pro.min.css"]').href;
    var version = fontawesome_pro_url.replace(/.*releases\/([^\/]+).*/g, '$1');
    var folderName = "fontawesome-" + version;

    function uniqid() {
        return Math.random().toString(36).substr(2, 9);
    };
    var link = document.createElement("a");
    link.href = fontawesome_pro_url;

    var zip = new JSZip();
    var root = zip.folder(folderName);
    var css = root.folder("css");
    var fonts = root.folder("fonts");
    fetch(link.href, {
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
    }).then(function(response) {
        var urles = {};
        response.text().then(function(style) {
            style = style.replace(/(?<=url\()([^\)]+)/g, function(url) {
                var a = document.createElement("a"),
                    b = document.createElement("a");
                a.href = url;
                b.href = (location.origin == a.origin ? link.origin : a.origin) + `/releases/${version}` + a.pathname;
                if (!urles[b.href]) {
                    urles[b.href] =a.pathname.split('/').pop();
                }
                console.log(b.href);
                return '../fonts/' + urles[b.href] + a.search + a.hash;
            });
            css.file('pro.css', beautifier.css(style));
            css.file('pro.min.css', style);
            (function(urls) {
                if (!urls.length) return;
                var url = urls.shift(),
                    name = urles[url],
                    callback = arguments.callee;
                fetch(url, {
                    mode: 'cors',
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                }).then(function(promise) {
                    fonts.file(name, promise.arrayBuffer());
                    if (urls.length) {
                        callback(urls)
                    } else {
                        zip.generateAsync({ type: "blob" }).then(function(source) {
                            saveAs(source, folderName + ".zip");
                        });
                    }
                }).catch((e) => {
                    callback(urls);
                });
            })(Object.keys(urles))
        });
    });
});
