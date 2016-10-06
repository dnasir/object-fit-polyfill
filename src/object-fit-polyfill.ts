interface Window {
    objectFitPolyfillOptions?: CssObjectFitPolyfill.ObjectFitOptions;
}

namespace CssObjectFitPolyfill {

    export interface ObjectFitOptions {
        responsive?: boolean;
        elements?: ObjectFitOptionsElement[];
    }

    export interface ObjectFitElementOptions {
        responsive?: boolean;
        objectFitType?: string;
    }

    export interface ObjectFitOptionsElement {
        selector: string;
        objectFitType: string;
    }

    export class ObjectFitElement {
        private container: HTMLElement;
        private options: ObjectFitElementOptions = {
            responsive: false,
            objectFitType: 'auto'
        };
        private tagName: string;

        constructor(private element: HTMLMediaElement, opts?: ObjectFitElementOptions) {
            this.tagName = this.element.tagName.toLowerCase();

            // only process images and videos
            if (this.tagName !== 'img' && this.tagName !== 'video') {
                return;
            }

            // set options
            if (typeof opts !== 'undefined') {
                for (let opt in opts) {
                    this.options[opt] = opts[opt];
                }
            }

            // create container element
            this.container = document.createElement('span');

            // replace the element with our container element
            this.element.parentNode.replaceChild(this.container, this.element);

            // inject the element as child to container
            this.container.appendChild(this.element);

            var elementStyle = window.getComputedStyle(this.element, null);
            for (let prop in elementStyle) {
                if (prop.match(/(backgroundColor|backgroundImage|borderColor|borderStyle|borderWidth|bottom|fontSize|lineHeight|height|left|opacity|margin|position|right|top|visibility|width|verticalAlign|position)/)) {
                    this.container.style[prop] = elementStyle[prop];
                }
            }

            this.container.style.display = elementStyle.display === 'block' ? 'block' : 'inline-block';
            this.container.style.overflow = 'hidden';

            this.element.style.position = 'relative';

            if (this.options.responsive) {
                var resizeTimeout: number;
                window.onresize = () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.refresh();
                    }, 100);
                };
            }

            window.addEventListener('load', () => {
                this.refresh();
            });
        }

        refresh(): void {
            var objectFitType = this.options.objectFitType !== 'auto' ? this.options.objectFitType : window.getComputedStyle(this.element, null)['object-fit'];
            if (typeof objectFitType === 'undefined') {
                return;
            }

            this.element.style.width = this.element.style.height = 'auto';
            var elementSizeRatio = this.element.offsetWidth / this.element.offsetHeight;

            switch (objectFitType) {
                case 'fill':
                    if (this.tagName === 'img') {
                        this.element.style.width = `${this.container.offsetWidth}px`;
                        this.element.style.height = `${this.container.offsetHeight}px`;
                    } else {
                        var sx = this.container.offsetWidth / this.element.offsetWidth;
                        var sy = this.container.offsetHeight / this.element.offsetHeight;

                        // TODO: Emulate fill by transforming the element
                        this.element.style[`${typeof this.element.style['transform-origin'] !== 'undefined' ? 'transform-origin' : '-ms-transform-origin'}`] = '0% 0%';
                        this.element.style[`${typeof this.element.style['transform'] !== 'undefined' ? 'transform' : '-ms-transform'}`] = `scale(${sx},${sy})`;
                    }
                    break;

                case 'contain':
                case 'scale-down':
                    if (elementSizeRatio > 1) { // wide element
                        this.element.style.width = `${this.container.offsetWidth}px`;
                        this.element.style.top = '50%';
                        this.element.style.marginTop = `-${this.element.offsetHeight / 2}px`;
                    } else { // tall element
                        this.element.style.height = `${this.container.offsetHeight}px`;
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = `-${this.element.offsetWidth / 2}px`;
                    }
                    break;

                case 'cover':
                    if (elementSizeRatio > 1) { // wide element
                        this.element.style.height = `${this.container.offsetHeight}px`;
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = `-${this.element.offsetWidth / 2}px`;
                    } else { // tall element
                        this.element.style.width = `${this.container.offsetWidth}px`;
                        this.element.style.top = '50%';
                        this.element.style.marginTop = `-${this.element.offsetHeight / 2}px`;
                    }
                    break;

                // object-fit: none
                default:
                    this.element.style.left = '50%';
                    this.element.style.marginLeft = `-${this.element.offsetWidth / 2}px`;
                    this.element.style.top = '50%';
                    this.element.style.marginTop = `-${this.element.offsetHeight / 2}px`;
                    break;
            }
        }
    }

    // check if object-fit is supported
    if (!('object-fit' in document.body.style)) {
        var options = window.objectFitPolyfillOptions || {};

        if (typeof options.elements !== 'undefined') {
            let len = options.elements.length;
            for (let i = 0; i < len; i++) {
                let elements = document.querySelectorAll(options.elements[i].selector);
                let e_len = elements.length;
                for (let j = 0; j < e_len; j++) {
                    let element = elements[j] as HTMLMediaElement;
                    var objectFitElementOptions: ObjectFitElementOptions = {
                        objectFitType: options.elements[i].objectFitType,
                        responsive: options.responsive
                    };

                    element['objectFitPolyfill'] = new ObjectFitElement(element, objectFitElementOptions);
                }
            }
        } else {
            let elements = document.querySelectorAll('img,video');
            let len = elements.length;
            for (let i = 0; i < len; i++) {
                var element = elements[i] as HTMLMediaElement;
                if (typeof window.getComputedStyle(element, null)['object-fit'] !== 'undefined') {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, options);
                }
            }
        }
    }
}