export const camelCaseToHyphen = (name: string): string => {
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
