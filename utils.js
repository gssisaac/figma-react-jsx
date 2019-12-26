export function isSvgNode(node) {
    return (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && node.children.find(child => child.type === 'VECTOR');
}
export function componentToHex(c) {
    const v = Math.round(c * 255);
    var hex = v.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
export function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}
export function getFillColor(node) {
    let color = null;
    const fills = (node.fills);
    if (fills.length > 0) {
        fills.forEach(fill => {
            if (fill.type === 'SOLID') {
                color = rgbToHex(fill.color);
            }
        });
    }
    return color;
}
