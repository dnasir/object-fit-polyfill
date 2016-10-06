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
            if (this.element.tagName.toLowerCase() !== 'img' && this.element.tagName.toLowerCase() !== 'video') {
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
            this.container.style.position = elementStyle.position;
            this.container.style.display = elementStyle.display === 'block' ? 'block' : 'inline-block';
            this.container.style.verticalAlign = elementStyle.verticalAlign;
            this.container.style.overflow = 'hidden';
            var elementSize = this.element.getBoundingClientRect();
            this.container.style.width = Number(elementSize.width) + "px";
            this.container.style.height = Number(elementSize.height) + "px";
            this.element.style.position = 'relative';
            if (this.element.tagName.toLowerCase() === 'video') {
                if (this.element.readyState > 3) {
                    this.refresh();
                }
                else {
                    this.element.oncanplay = function () {
                        _this.refresh();
                    };
                }
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
            var containerSize = this.container.getBoundingClientRect();
            this.element.style.width = 'auto';
            this.element.style.height = 'auto';
            var elementSize = this.element.getBoundingClientRect();
            switch (objectFitType) {
                case 'fill':
                    if (this.element.tagName.toLowerCase() === 'video') {
                        var elementSizeRatio = elementSize.width / elementSize.height;
                        if (elementSizeRatio > 1) {
                            this.element.style.height = Number(containerSize.height) + "px";
                        }
                        else {
                            this.element.style.width = Number(containerSize.width) + "px";
                        }
                        var sx = containerSize.width / this.element.getBoundingClientRect().width;
                        var sy = containerSize.height / this.element.getBoundingClientRect().height;
                    }
                    else {
                        this.element.style.width = Number(containerSize.width) + "px";
                        this.element.style.height = Number(containerSize.height) + "px";
                    }
                    break;
                case 'contain':
                case 'scale-down':
                    var elementSizeRatio = elementSize.width / elementSize.height;
                    if (elementSizeRatio > 1) {
                        this.element.style.width = Number(containerSize.width) + "px";
                        this.element.style.top = '50%';
                        this.element.style.marginTop = "-" + Number(this.element.getBoundingClientRect().height / 2) + "px";
                    }
                    else {
                        this.element.style.height = Number(containerSize.height) + "px";
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = "-" + Number(this.element.getBoundingClientRect().width / 2) + "px";
                    }
                    break;
                case 'cover':
                    var containerSizeRatio = containerSize.width / containerSize.height;
                    var elementSizeRatio = elementSize.width / elementSize.height;
                    if (containerSizeRatio > 1) {
                        if (elementSizeRatio > 1) {
                            this.element.style.height = Number(this.container.getBoundingClientRect().height) + "px";
                            this.element.style.left = '50%';
                            this.element.style.marginLeft = "-" + Number(this.element.getBoundingClientRect().width / 2) + "px";
                        }
                        else {
                            this.element.style.width = Number(this.container.getBoundingClientRect().width) + "px";
                            this.element.style.top = '50%';
                            this.element.style.marginTop = "-" + Number(this.element.getBoundingClientRect().height / 2) + "px";
                        }
                    }
                    else {
                        if (elementSizeRatio > 1) {
                            this.element.style.height = Number(this.container.getBoundingClientRect().height) + "px";
                            this.element.style.left = '50%';
                            this.element.style.marginLeft = "-" + Number(this.element.getBoundingClientRect().width / 2) + "px";
                        }
                        else {
                            this.element.style.width = Number(this.container.getBoundingClientRect().width) + "px";
                            this.element.style.top = '50%';
                            this.element.style.marginTop = "-" + Number(this.element.getBoundingClientRect().height / 2) + "px";
                        }
                    }
                    break;
                default:
                    this.element.style.left = '50%';
                    this.element.style.marginLeft = "-" + Number(this.element.getBoundingClientRect().width / 2) + "px";
                    this.element.style.top = '50%';
                    this.element.style.marginTop = "-" + Number(this.element.getBoundingClientRect().height / 2) + "px";
                    break;
            }
        };
        return ObjectFitElement;
    }());
    CssObjectFitPolyfill.ObjectFitElement = ObjectFitElement;
    window.addEventListener('load', function () {
        if ('object-fit' in document.body.style) {
            return;
        }
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
                if (typeof window.getComputedStyle(element, null).getPropertyValue('object-fit') !== 'undefined') {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, options);
                }
            }
        }
    }, false);
})(CssObjectFitPolyfill || (CssObjectFitPolyfill = {}));
