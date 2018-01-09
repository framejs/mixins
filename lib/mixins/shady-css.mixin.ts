import { applyShadyCSS } from '../utils/apply-shady-css';

export interface ShadyCSSMixin {
    render(): string;
}

/**
 * ShadyCSSMixins applies ShadyCSS to the template if it's available
 * in global window to support unsupported browsers.
 *
 * @mixin
 * @example
 * class MyClass extends ShadyCSSMixin implements ShadyCSSMixin {
 *     static get is() {
 *         return 'my-class'
 *     }
 *
 *     render() {
 *         return `
 *             <style>:host { color: blue} </style>
 *             <slot></slot>
 *         `;
 *     }
 * }
 */
export const ShadyCSSMixin = (Base: any = HTMLElement): any => {
    return class extends (Base as { new (): any }) {
        constructor() {
            super();
            this._template = document.createElement('template');
            this._template.innerHTML = this.render();
            applyShadyCSS(this._template, (<any>this.constructor).is);
            this.attachShadow({ mode: 'open' }).appendChild(this._template.content.cloneNode(true));
        }

    };
};
