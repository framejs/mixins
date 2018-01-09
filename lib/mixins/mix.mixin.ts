export const Mix = superclass => new MixinBuilder(superclass);

/**
 * Creates a new class that extends with multiple mixins.
 *
 * @mixin
 * @example
 * class MyClass extends Mix(HTMLElement).with(Mixin, OtherMixin) {...}
 * @param {Function} superclass - The base class to extend upon.
 */
export class MixinBuilder {
    public superclass: any;

    constructor(superclass) {
        this.superclass = superclass;
    }

    with(...mixins) {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }
}
