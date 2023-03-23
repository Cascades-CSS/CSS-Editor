# <img width="48" src="https://github.com/Gigabyte5671/CSS-Editor/raw/main/src/assets/branding/logo.svg"> CSS Editor

An optimized editor, just for CSS.

Try it out with the [demo](https://css-editor.zakweb.dev/).

## Installation

Install CSS Editor with:
```sh
npm install css-editor
```

## Usage

Import the `CSSEditor` class into your project:
```typescript
import { CSSEditor } from '/src/index.ts';
```

Attach the editor to an element on your page:
```typescript
const editor = new CSSEditor('#editor');    // Replace '#editor' with the selector for your element.
```

Listen to changes in the stylesheet with a callback:
```typescript
function yourCallback (stylesheet) {
    // Do something awesome!
}

const callbackID = editor.onUpdate(yourCallback);
// You can add as many callbacks as you like. They will all be called whenever the stylesheet is updated.
```

Stop listening to changes in the stylesheet:
```typescript
editor.offUpdate(callbackID);
```

The `CSSEditor` class also has two static methods, `parse` and `stringify`:
```typescript
// Convert a CSS string into a stylesheet object.
const stylesheet = CSSEditor.parse('div { border: 10px solid red; }');
```

```typescript
// Convert a stylesheet object into a CSS string.
const stylesheet = [
    {
        selector: 'div',
        properties: [
            {
                key: 'border',
                values: [ '10px', 'solid', 'red' ] 
            }
        ]
    }
];
const string = CSSEditor.stringify(stylesheet);
```


## Development

### Install Dependencies

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile, and Minify for Production

```sh
npm run build
```

### Type-Check, Compile, and Minify for NPM

```sh
npm run build-package
```
