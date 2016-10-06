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

## Applying polyfill options

You can apply global options for the polyfill like so:

```
window.objectFitPolyfillOptions = {
    responsive: true
}
```

## Additional setup for MS Edge

Since MS Edge ignores all "invalid" properties that are not members of the [``CSSStyleDeclaration``](https://developer.mozilla.org/en/docs/Web/API/CSSStyleDeclaration) object, it will therefore not return
the value for ``object-fit`` like IE does. This may be a bug in IE - I don't know. So we need to force apply the polyfill to our elements.

```
window.objectFitPolyfillOptions = {
    elements: [
        {
            selector: '.fill',      // selector to use in document.querySelectorAll()
            objectFitType: 'fill'   // object-fit type to use
        }
    ]
}
```

# Known issues

- Video controls are sometimes partially visible or not visible at all.
- Auto-polyfill doesn't work on Edge due to ``window.getComputedStyle()`` not returning values for "invalid" properties.