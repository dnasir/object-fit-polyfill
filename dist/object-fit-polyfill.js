var ObjectFitPolyfill;
(function (ObjectFitPolyfill) {
    function extend() {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        for (var i = 1; i < objs.length; i++) {
            for (var key in objs[i]) {
                if (objs[i].hasOwnProperty(key)) {
                    objs[0][key] = objs[i][key];
                }
            }
        }
        return objs[0];
    }
    var ObjectFitElement = (function () {
        function ObjectFitElement(element, opts) {
            var _this = this;
            this.element = element;
            this.options = {
                altPropName: 'font-family',
                responsive: false,
                objectFitType: 'none'
            };
            this.tagName = this.element.tagName.toLowerCase();
            if (this.tagName !== 'img' && this.tagName !== 'video') {
                return;
            }
            if (typeof opts !== 'undefined') {
                this.options = extend(this.options, opts);
            }
            this.container = document.createElement('span');
            this.element.parentNode.replaceChild(this.container, this.element);
            this.container.appendChild(this.element);
            var elementStyle = window.getComputedStyle(this.element, null);
            for (var prop in elementStyle) {
                if (prop.match(/(backgroundColor|backgroundImage|borderColor|borderStyle|borderWidth|bottom|fontSize|lineHeight|height|left|opacity|margin|position|right|top|visibility|width|verticalAlign|position)/)) {
                    this.container.style[prop] = elementStyle[prop];
                }
            }
            this.container.style.display = elementStyle.display === 'block' ? 'block' : 'inline-block';
            this.container.style.overflow = 'hidden';
            this.element.style.position = 'relative';
            if (this.options.responsive) {
                var resizeTimeout_1;
                window.onresize = function () {
                    clearTimeout(resizeTimeout_1);
                    resizeTimeout_1 = setTimeout(function () {
                        _this.refresh();
                    }, 100);
                };
            }
            window.addEventListener('load', function () {
                _this.refresh();
            });
        }
        ObjectFitElement.prototype.refresh = function () {
            this.element.style.width = this.element.style.height = 'auto';
            var elementSizeRatio = this.element.offsetWidth / this.element.offsetHeight;
            switch (this.options.objectFitType) {
                case 'fill':
                    if (this.tagName === 'img') {
                        this.element.style.width = this.container.offsetWidth + "px";
                        this.element.style.height = this.container.offsetHeight + "px";
                    }
                    else {
                        var sx = this.container.offsetWidth / this.element.offsetWidth;
                        var sy = this.container.offsetHeight / this.element.offsetHeight;
                        this.element.style[("" + (typeof this.element.style['transform-origin'] !== 'undefined' ? 'transform-origin' : '-ms-transform-origin'))] = '0% 0%';
                        this.element.style[("" + (typeof this.element.style['transform'] !== 'undefined' ? 'transform' : '-ms-transform'))] = "scale(" + sx + "," + sy + ")";
                    }
                    break;
                case 'contain':
                case 'scale-down':
                    if (elementSizeRatio > 1) {
                        this.element.style.width = this.container.offsetWidth + "px";
                        this.element.style.top = '50%';
                        this.element.style.marginTop = "-" + this.element.offsetHeight / 2 + "px";
                    }
                    else {
                        this.element.style.height = this.container.offsetHeight + "px";
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = "-" + this.element.offsetWidth / 2 + "px";
                    }
                    break;
                case 'cover':
                    if (elementSizeRatio > 1) {
                        this.element.style.height = this.container.offsetHeight + "px";
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = "-" + this.element.offsetWidth / 2 + "px";
                    }
                    else {
                        this.element.style.width = this.container.offsetWidth + "px";
                        this.element.style.top = '50%';
                        this.element.style.marginTop = "-" + this.element.offsetHeight / 2 + "px";
                    }
                    break;
                default:
                    this.element.style.left = '50%';
                    this.element.style.marginLeft = "-" + this.element.offsetWidth / 2 + "px";
                    this.element.style.top = '50%';
                    this.element.style.marginTop = "-" + this.element.offsetHeight / 2 + "px";
                    break;
            }
        };
        return ObjectFitElement;
    }());
    ObjectFitPolyfill.ObjectFitElement = ObjectFitElement;
    var defaultObjectFitOptions = {
        altPropName: 'font-family',
        responsive: false
    };
    if (!('object-fit' in document.body.style)) {
        var options = extend(defaultObjectFitOptions, window.objectFitPolyfillOptions);
        var elements = document.querySelectorAll('img,video');
        var len = elements.length;
        for (var i = 0; i < len; i++) {
            var element = elements[i];
            var polyfillType = window.getComputedStyle(element, null)['object-fit'];
            if (typeof polyfillType !== 'undefined') {
                element['objectFitPolyfill'] = new ObjectFitElement(element, {
                    responsive: options.responsive,
                    objectFitType: polyfillType
                });
            }
            else {
                var valueFromAltProp = window.getComputedStyle(element, null)[options.altPropName];
                var typeFromAltProp = valueFromAltProp.match(/object-fit\s*:\s*(.+)\s*;/);
                if (typeFromAltProp !== null) {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, {
                        responsive: options.responsive,
                        objectFitType: typeFromAltProp[1]
                    });
                }
            }
        }
    }
})(ObjectFitPolyfill || (ObjectFitPolyfill = {}));
