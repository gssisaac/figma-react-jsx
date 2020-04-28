import * as JSZip from 'jszip'

import { exportReactHooksComponent } from './jsx';
import { isContainer } from './utils';

// import { js2xml } from 'xml-js'

figma.showUI(__html__, {
  width: 500,
  height: 500,
})

const buildTree = (node: any, tree = {}) => {
  if (node.children) {
    node.children.forEach((node: any) => {
      tree[node.name] = buildTree(node, {})
    });
  } else {
    tree[node.name] = {}
  }
  return tree;
}

figma.ui.onmessage = msg => {

  if (msg.type === 'initialized') {
    const layers = figma.currentPage.selection.length ?
      figma.currentPage.selection : figma.currentPage.children;
    const messages = [];
    layers.forEach(node => {
      const layerName = node.name;
      // const tree = {
      //   [layerName]: buildTree(node),
      // };
      // const xml = js2xml(tree, { compact: true, spaces: 2, fullTagEmptyElement: true });
      if (isContainer(node)) {
      const data = exportReactHooksComponent(node)
        messages.push({
          type: 'add-hooks',
          name: layerName,
          filename: layerName + '.tsx',
          raw_data: data,
          text: `Export`,
          data: Buffer.from(data).toString('base64'),
        })
      }
    })

    messages.forEach(message => {
      figma.ui.postMessage(message);
    })

    let zip: JSZip = new JSZip();
    messages.forEach(message => {
      zip.file(`layers/${message.filename}`, message.raw_data)
    });
    zip.generateAsync({ type: 'base64' }).then(function (base64) {
      figma.ui.postMessage({
        type: 'add-zip',
        filename: 'Layers.zip',
        text: `Export ${layers.length} selected layers (zip)`,
        data: base64,
      });
    });
  } else {
    figma.closePlugin()
  }
}
