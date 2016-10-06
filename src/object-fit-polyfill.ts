/**
 * Object-fit Polyfill
 * 
 * 
 */


interface Window {
    objectFitPolyfillOptions?: CssObjectFitPolyfill.ObjectFitOptions;
}

module CssObjectFitPolyfill {

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

        constructor(private element: HTMLMediaElement, opts?: ObjectFitElementOptions) {
            // only process images and videos
            if (this.element.tagName.toLowerCase() !== 'img' && this.element.tagName.toLowerCase() !== 'video') {
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
            this.container.style.position = elementStyle.position;
            this.container.style.display = elementStyle.display === 'block' ? 'block' : 'inline-block';
            this.container.style.verticalAlign = elementStyle.verticalAlign;
            this.container.style.overflow = 'hidden';

            let elementSize = this.element.getBoundingClientRect();
            this.container.style.width = `${Number(elementSize.width)}px`;
            this.container.style.height = `${Number(elementSize.height)}px`;

            this.element.style.position = 'relative';

            if (this.element.tagName.toLowerCase() === 'video') {
                // for video files that are already loaded (maybe via cache)
                if (this.element.readyState > 3) {
                    this.refresh();
                } else {
                    // wait til video is available otherwise we'll get the wrong sizes
                    this.element.oncanplay = () => {
                        this.refresh();
                    };
                }
            } else {
                this.refresh();
            }

            if (this.options.responsive) {
                var resizeTimeout: number;
                window.onresize = () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.refresh();
                    }, 100);
                }
            }
        }

        refresh(): void {
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
                        if (elementSizeRatio > 1) { // wide element
                            this.element.style.height = `${Number(containerSize.height)}px`;
                        } else { // tall element
                            this.element.style.width = `${Number(containerSize.width)}px`;
                        }

                        var sx = containerSize.width / this.element.getBoundingClientRect().width;
                        var sy = containerSize.height / this.element.getBoundingClientRect().height;

                        // TODO: Emulate fill by transforming the element
                        //this.element.style.transform = `scale3d(${sx}, ${sy}, 1)`;
                    } else {
                        this.element.style.width = `${Number(containerSize.width)}px`;
                        this.element.style.height = `${Number(containerSize.height)}px`;
                    }
                    break;

                case 'contain':
                case 'scale-down':
                    var elementSizeRatio = elementSize.width / elementSize.height;

                    if (elementSizeRatio > 1) { // wide element
                        this.element.style.width = `${Number(containerSize.width)}px`;
                        this.element.style.top = '50%';
                        this.element.style.marginTop = `-${Number(this.element.getBoundingClientRect().height / 2)}px`;
                    } else { // tall element
                        this.element.style.height = `${Number(containerSize.height)}px`;
                        this.element.style.left = '50%';
                        this.element.style.marginLeft = `-${Number(this.element.getBoundingClientRect().width / 2)}px`;
                    }
                    break;

                case 'cover':
                    var containerSizeRatio = containerSize.width / containerSize.height;
                    var elementSizeRatio = elementSize.width / elementSize.height;

                    if (containerSizeRatio > 1) { // wide container
                        if (elementSizeRatio > 1) { // wide element
                            this.element.style.height = `${Number(this.container.getBoundingClientRect().height)}px`;
                            this.element.style.left = '50%';
                            this.element.style.marginLeft = `-${Number(this.element.getBoundingClientRect().width / 2)}px`;
                        } else { // tall element
                            this.element.style.width = `${Number(this.container.getBoundingClientRect().width)}px`;
                            this.element.style.top = '50%';
                            this.element.style.marginTop = `-${Number(this.element.getBoundingClientRect().height / 2)}px`;
                        }
                    } else { // tall container
                        if (elementSizeRatio > 1) { // wide element
                            this.element.style.height = `${Number(this.container.getBoundingClientRect().height)}px`;
                            this.element.style.left = '50%';
                            this.element.style.marginLeft = `-${Number(this.element.getBoundingClientRect().width / 2)}px`;
                        } else { // tall element
                            this.element.style.width = `${Number(this.container.getBoundingClientRect().width)}px`;
                            this.element.style.top = '50%';
                            this.element.style.marginTop = `-${Number(this.element.getBoundingClientRect().height / 2)}px`;
                        }
                    }
                    break;

                // object-fit: none
                default:
                    this.element.style.left = '50%';
                    this.element.style.marginLeft = `-${Number(this.element.getBoundingClientRect().width / 2)}px`;
                    this.element.style.top = '50%';
                    this.element.style.marginTop = `-${Number(this.element.getBoundingClientRect().height / 2)}px`;
                    break;
            }
        }
    }

    window.addEventListener('load', function () {
        if ('object-fit' in document.body.style) {
            return;
        }

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
                if (typeof window.getComputedStyle(element, null).getPropertyValue('object-fit') !== 'undefined') {
                    element['objectFitPolyfill'] = new ObjectFitElement(element, options);
                }
            }
        }
    }, false);
}