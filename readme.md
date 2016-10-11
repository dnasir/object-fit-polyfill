Object-fit Polyfill
===

Yet another attempt at polyfilling ``object-fit`` for crappy browsers that don't support it (*cough* IE *cough*).

# Supported browsers

- IE9+
- MS Edge (requires additional setup)

# Supported elements

- Images
- Videos

Picture is not supported on the account IE doesn't support it anyway.

# Configuration

1. Include the polyfill script in your markup.
2. That's it.

## Options

### ``responsive`` (default: ``false``)

Specifies whether the polyfill should respond to page resize.

```js
window.objectFitPolyfillOptions = {
    responsive: true
}
```

### ``altPropName`` (default: ``font-family``)

Since MS Edge ignores all "invalid" properties that are not members of the [``CSSStyleDeclaration``](https://developer.mozilla.org/en/docs/Web/API/CSSStyleDeclaration) object,
it will therefore not return the value for ``object-fit`` like IE does. This may be a bug in IE - I don't know.

So, in order for us to circumvent this problem, we can inject the ``object-fit`` property as the value for a valid property.

```css
.fill {
    object-fit: fill;
    font-family: "object-fit: fill;";
}
```

If you'd like to use a different CSS property for this, set the ``altPropName`` options value to the CSS property name you'd like to use.

```js
window.objectFitPolyfillOptions = {
    altPropName: 'color'
}
```

# Known issues

- Video controls are sometimes partially visible or not visible at all.
- Videos may not show up correctly on IE due to the transform style being applied.
- Auto-polyfill doesn't work on Edge without additional configuration due to ``window.getComputedStyle()`` not returning values for "invalid" properties.
