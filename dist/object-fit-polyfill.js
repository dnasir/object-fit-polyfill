var CssObjectFitPolyfill;
(function (CssObjectFitPolyfill) {
    var ObjectFitElement = (function () {
        function ObjectFitElement(element, opts) {
            var _this = this;
            this.element = element;
            this.options = {
                responsive: false,
                objectFitType: 'auto'
            };
            this.tagName = this.element.tagName.toLowerCase();
            if (this.tagName !== 'img' && this.tagName !== 'video') {
                return;
            }
            if (typeof opts !== 'undefined') {
                for (var opt in opts) {
                    this.options[opt] = opts[opt];
                }
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
            if (this.tagName === 'video') {
                this.element.oncanplay = function () {
                    _this.refresh();
                };
            }
            else {
                this.refresh();
            }
            if (this.options.responsive) {
                var resizeTimeout;
                window.onresize = function () {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function () {
                        _this.refresh();
                    }, 100);
                };
            }
        }
        ObjectFitElement.prototype.refresh = function () {
            var objectFitType = this.options.objectFitType !== 'auto' ? this.options.objectFitType : window.getComputedStyle(this.element, null)['object-fit'];
            if (typeof objectFitType === 'undefined') {
                return;
            }
            this.element.style.width = this.element.style.height = 'auto';
            var elementSizeRatio = this.element.offsetWidth / this.element.offsetHeight;
            switch (objectFitType) {
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
    CssObjectFitPolyfill.ObjectFitElement = ObjectFitElement;
    if (!('object-fit' in document.body.style)) {
        var options = window.objectFitPolyfillOptions || {};
        if (typeof options.elements !== 'undefined') {
            var len = options.elements.length;
            for (var i = 0; i < len; i++) {
                var elements = document.querySelectorAll(options.elements[i].selector);
                var e_len = elements.length;
                for (var j = 0; j < e_len; j++) {
                    var element_1 = elements[j];
                    var objectFitElementOptions = {
                        objectFitType: options.elements[i].objectFitType,
                        responsive: options.responsive
                    };
                    element_1['objectFitPolyfill'] = new ObjectFitElement(element_1, objectFitElementOptions);
                }
            }
        }
        else {
            var elements = document.querySelectorAll('img,video');
            var len = elements.length;
            for (var i = 0; i < len; i++) {
                var element = elements[i];
                if (typeof window.getComputedStyle(element, null)['object-fit'] !== 'undefined') {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, options);
                }
            }
        }
    }
})(CssObjectFitPolyfill || (CssObjectFitPolyfill = {}));
