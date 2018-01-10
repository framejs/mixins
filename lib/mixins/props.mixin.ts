import { camelCaseToHyphen } from '../utils/camel-case-to-hyphen';
import { hyphenToCamelCase } from '../utils/hyphen-to-camel-case';
import { polyfillCustomEvent } from '../polyfills/custom-event';

export interface IProps {
    [key:string]: IProperty
}

export interface IProperty {
    type: Function;
    reflectToAttribute?: boolean;
    value?: string | boolean | object | number;
    observer?: string;
    notify?: boolean;
}

/**
 * PropsMixins provides a slick way to write properties that
 * reflects to attributes and observes on attribute changes and property changes
 * with the same API.
 *
 * @mixin
 * @example
 * class MyClass extends PropsMixin {
 *     static get props() {
 *         return {
 *             myProp: {
 *                 type: String, // String | Boolean | Object | Number | Array
 *                 reflectToAttribute: true, // true | false (optional)
 *                 value: 'Hello', // (optional)
 *                 observer: '_myPropChanged' // (optional),
 *                 notify: true (optional)
 *             }
 *         }
 *     }
 *
 *     // Executes on load and every time the
 *     // attribute or property changes
 *     _myPropChanges(oldValue, newValue) {
 *         console.log(oldValue, newValue)
 *     }
 * }
 */

export const PropsMixin = (Base: any = HTMLElement): any => {
    return class extends (Base as { new (): HTMLElement }) {
        _properties: IProps = (<any>this.constructor).props;
        _observerStore = {};
        _data: any;

        constructor() {
            super();
            if (!this._properties) {
                return;
            }

            this._initObserver();
            this._initDataProxy();
            polyfillCustomEvent();
        }

        connectedCallback() {
            if (!this._properties) {
                return;
            }

            Object.keys(this._properties).forEach(key => {
                const attr = camelCaseToHyphen(key);
                const prop = this._properties[key];
                const observer = prop.observer;
                const type = prop.type.name;

                // Add observer function name to store
                this._observerStore[attr] = observer;

                // Get default value
                if (this.hasAttribute(attr)) {
                    this._data[attr] = this._getAttribute(attr, type);
                } else {
                    this._data[attr] = prop.value;
                }

                // Set default attribute value
                if (prop.reflectToAttribute) {
                    this._setAttribute(attr, this._data[attr], type);
                }

                // Define properties on instance
                Object.defineProperty(this, key, {
                    [observer]: function(oldVal, newVal) {
                        return;
                    },
                    set: function(val) {
                        this._data[attr] = val;

                        if (prop.reflectToAttribute) {
                            this._setAttribute(attr, val, type);
                        }
                    },
                    get: function() {
                        return prop.reflectToAttribute
                            ? this._getAttribute(attr, type)
                            : this._data[attr];
                    },
                });
            });
        }

        _setAttribute(attr, value, type) {
            if (type === 'Boolean') {
                if (!Boolean(value)) {
                    this.removeAttribute(attr)
                } else {
                    this.setAttribute(attr, '');
                }
            }

            if (type === 'String' || type === 'Number') {
                if (value) this.setAttribute(attr, value.toString());
            }

            if (type === 'Array' || type === 'Object') {
                if (value) this.setAttribute(attr, JSON.stringify(value));
            }
        }

        _getAttribute(attr, type) {
            if (type === 'Boolean') {
                return this.hasAttribute(attr);
            }

            if (type === 'Object' || type === 'Number' || type === 'Array') {
                return JSON.parse(this.getAttribute(attr));
            }

            if (type === 'String') {
                return this.getAttribute(attr);
            }
        }

        _initObserver() {
            const attributeObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    const attr = mutation.attributeName;
                    if (this._data[attr]) {
                        this._data[attr] = this[hyphenToCamelCase(attr)];
                    }
                });
            });

            attributeObserver.observe(this, { attributes: true });
        }

        _initDataProxy() {
            const context = this;
            const dataHandler = {
                get: (obj, prop) => {
                    return obj[prop];
                },
                set: (obj, prop, value) => {
                    let storedValue = obj[prop];
                    const isNewValue = storedValue !== value;

                    if (isNewValue) {
                        const observerFunction = context._observerStore[prop];
                        const propertyFromStore = context._properties[hyphenToCamelCase(prop)];

                        // Fire observer function
                        if (observerFunction) {
                            context[observerFunction](storedValue, value);
                        }

                        // Fire custom event
                        if (storedValue && propertyFromStore.notify) {
                            const event = new CustomEvent(`${prop}-changed`, {
                                detail: { [prop]: value }
                            });

                            context.dispatchEvent(event);
                        }
                    }

                    // Update stored value
                    obj[prop] = value;

                    return true;
                },
            };

            this._data = new Proxy({}, dataHandler);
        }
    };
};
