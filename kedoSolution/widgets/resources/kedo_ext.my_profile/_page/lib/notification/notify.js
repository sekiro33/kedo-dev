(function () {
    var $container = createNotifyContainer();
    function init() { document.body.append($container); window.notify = notify; }

    function notify(options) {
        if (!isOptionsValid(options)) return;
        var $item = createNotifyItem(options.message || "", options.color || "default");
        if (options.timeout) {
            setAutocloseTimeout($item, options.timeout);
        }
        setCloseOnClick($item); $container.append($item);
    }

    function createNotifyContainer() {
        var $container = document.createElement("div");
        $container.className = "notify-container";
        return $container;
    }

    function createNotifyItem(message, color) {
        var $item = document.createElement("div");

        $item.classList.add("notify-item");
        $item.classList.add("notify-item--" + color);
        $item.innerHTML = message;

        $item.onclick = () => {
            $item.remove();
        };

        return $item;
    }

    function setCloseOnClick($el) { $el.addEventListener("click", function () { $el.remove(); }); }
    function setAutocloseTimeout($el, timeout) {
        setTimeout(function () {
            if ($el) $el.remove();
        }, timeout);
    }
    function isOptionsValid(options) { return (options || console.error(`options is undefined`)); }
    init();
})();
