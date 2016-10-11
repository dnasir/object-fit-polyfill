interface Window {
    objectFitPolyfillOptions?: ObjectFitOptions;
}

interface ObjectFitOptions {
    altPropName?: string;
    responsive?: boolean;
}

interface ObjectFitElementOptions {
    altPropName?: string;
    responsive?: boolean;
    objectFitType?: string;
}

interface ObjectFitOptionsElement {
    objectFitType: string;
    selector: string;
}

namespace ObjectFitPolyfill {

    function extend(...objs: any[]): any {
        for (let i = 1; i < objs.length; i++) {
            for (let key in objs[i]) {
                if (objs[i].hasOwnProperty(key)) {
                    objs[0][key] = objs[i][key];
                }
            }
        }
        return objs[0];
    }

    export class ObjectFitElement {
        private container: HTMLElement;
        private options: ObjectFitElementOptions = {
            altPropName: 'font-family',
            responsive: false,
            objectFitType: 'none'
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
                this.options = extend(this.options, opts);
            }

            // create container element
            this.container = document.createElement('span');

            // replace the element with our container element
            this.element.parentNode.replaceChild(this.container, this.element);

            // inject the element as child to container
            this.container.appendChild(this.element);

            const elementStyle = window.getComputedStyle(this.element, null);
            for (let prop in elementStyle) {
                if (prop.match(/(backgroundColor|backgroundImage|borderColor|borderStyle|borderWidth|bottom|fontSize|lineHeight|height|left|opacity|margin|position|right|top|visibility|width|verticalAlign|position)/)) {
                    this.container.style[prop] = elementStyle[prop];
                }
            }

            this.container.style.display = elementStyle.display === 'block' ? 'block' : 'inline-block';
            this.container.style.overflow = 'hidden';

            this.element.style.position = 'relative';

            if (this.options.responsive) {
                let resizeTimeout: number;
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

        public refresh(): void {
            this.element.style.width = this.element.style.height = 'auto';
            const elementSizeRatio = this.element.offsetWidth / this.element.offsetHeight;

            switch (this.options.objectFitType) {
                case 'fill':
                    if (this.tagName === 'img') {
                        this.element.style.width = `${this.container.offsetWidth}px`;
                        this.element.style.height = `${this.container.offsetHeight}px`;
                    } else {
                        const sx = this.container.offsetWidth / this.element.offsetWidth;
                        const sy = this.container.offsetHeight / this.element.offsetHeight;

                        // Emulate fill by transforming the element
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

    const defaultObjectFitOptions: ObjectFitOptions = {
        altPropName: 'font-family',
        responsive: false
    };

    // check if object-fit is supported
    if (!('object-fit' in document.body.style)) {
        const options = extend(defaultObjectFitOptions, window.objectFitPolyfillOptions);
        const elements = document.querySelectorAll('img,video');
        const len = elements.length;

        for (let i = 0; i < len; i++) {
            let element = elements[i] as HTMLMediaElement;
            let polyfillType = window.getComputedStyle(element, null)['object-fit'];

            if (typeof polyfillType !== 'undefined') { // IE9-11
                element['objectFitPolyfill'] = new ObjectFitElement(element, {
                    responsive: options.responsive,
                    objectFitType: polyfillType
                });
            } else {
                let valueFromAltProp = window.getComputedStyle(element, null)[options.altPropName];
                let typeFromAltProp = valueFromAltProp.match(/object-fit\s*:\s*(.+)\s*;/);

                if (typeFromAltProp !== null) {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, {
                        responsive: options.responsive,
                        objectFitType: typeFromAltProp[1]
                    });
                }
            }
        }
    }
}
