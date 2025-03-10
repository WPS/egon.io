export function sanitizeTextForSVGExport(str: string): string {
    return str.replaceAll("--", "––");
}

// sanitize user-Input to be Desktop-Filename safe
export function sanitizeForDesktop(str: string): string {
    const map: { [key: string]: string } = {
        "/": "",
        "\\": "",
        ":": "",
        "*": "",
        "?": "",
        '"': "",
        "<": "",
        ">": "",
        "|": "",
    };
    const reg = /[/\\:*?"<>|]/gi;
    return str ? sanitizeTextForSVGExport(str.replace(reg, (match) => map[match])) : "";
}

export function sanitizeIconName(name: string): string {
    if (!name) {
        return "";
    }
    const nameWithoutFileEnding =
        name.lastIndexOf(".") > 0 ? name.substring(0, name.lastIndexOf(".")) : name;
    const map: { [key: string]: string } = {
        "/": "",
        "\\": "",
        ":": "",
        "*": "",
        "?": "",
        '"': "",
        "<": "",
        ">": "",
        "|": "",
        "(": "",
        ")": "",
        " ": "-",
    };
    const reg = /[/\\:*?"<>|() ]/gi;
    return nameWithoutFileEnding.trim().replace(reg, (match) => map[match]);
}
