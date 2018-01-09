export const applyShadyCSS = (template: HTMLElement, tag: string) => {
    if ((<any>window).ShadyCSS) {
        (<any>window).ShadyCSS.prepareTemplate(template, tag);
    } else {
        return;
    }
}
