# @fe-infra/keystone-icons

`@fe-infra/keystone-icons` is a versatile and lightweight icon library built as web components using Stencil.js. This library provides a collection of customizable icons that can be easily integrated into your web applications, regardless of the framework you're using.

## Installation

You can install `@fe-infra/keystone-icons` using package managers:

```bash
npm install @fe-infra/keystone-icons
```

or

```bash
yarn add @fe-infra/keystone-icons
```

or

```bash
pnpm add @fe-infra/keystone-icons
```

## Usage

### Basic Usage

`@fe-infra/keystone-icons` provides two ways to use the icon components: lazy loading and custom elements. Each method has its own advantages and use cases.

#### 1. Lazy Loading

Lazy loading allows you to load icon components on-demand, which can improve initial load time and performance, especially for larger applications.

```javascript
import { defineCustomElements } from '@fe-infra/keystone-icons/loader';

defineCustomElements();
```

Then in your HTML:

```html
<ks-icon-home></ks-icon-home>
```

#### 2. Custom Elements

This method involves importing and registering each icon component individually, giving you more control over which components are included in your bundle.

```javascript
import { KsIconHome } from '@fe-infra/keystone-icons/components';

customElements.define('ks-icon-home', KsIconHome);
```

or

```javascript
import { defineCustomElementKsIconHome } from '@fe-infra/keystone-icons/components';

defineCustomElementKsIconHome();
```

Then in your HTML:

```html
<ks-icon-home></ks-icon-home>
```

### Customizing Icons

You can customize the appearance of the icons using attributes:

```html
<ks-icon-home size="24" color="#007bff"></ks-icon-home>
```

#### Available Attributes

- **size**: Sets the width and height of the icon (default: 24)
- **color**: Sets the color of the icon (default: currentColor)

### Using with Different Frameworks

Please refer to the documentation of the framework you're using to learn how to use the icons with it.

## License

`@fe-infra/keystone-icons` is released under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Support

If you encounter any issues or have questions about `@fe-infra/keystone-icons`, please file an issue on our [Codebase repository](https://code.byted.org/ad/byted-web-components/issues) or join our [Lark group chat](https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=d2fj9cdd-181d-4454-9d61-d7c4c7i7f7l8).

## Acknowledgements

`@fe-infra/keystone-icons` is built with Stencil.js, a powerful toolchain for building reusable, scalable web components.
