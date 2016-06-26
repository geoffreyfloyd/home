export default function (id, message, visible, x, y) {
    var element = document.getElementById(id);
    if (element) {
        document.body.removeChild(element);
    }

    if (visible && message) {
        var div = document.createElement('div');
        div.setAttribute('id', id);
        div.setAttribute('style', 'position:absolute;top:' + (y || 0) + 'px;left:' + (x || 0) + 'px;border-radius:0.5rem;padding:0.5rem 1rem;display:inline;max-width:16rem;background-color:#444;color:#ddd;z-index:100;');
        div.innerHTML = message;
        document.body.appendChild(div);
    }
}
