# @fe-infra/keystone-icons-react

`@fe-infra/keystone-icons-react` is a React-specific implementation of the Keystone Icons library, built using Stencil.js. This package provides a collection of customizable icons as React components, allowing seamless integration into your React applications.

## Installation

You can install `@fe-infra/keystone-icons-react` using package managers:

```bash
npm install @fe-infra/keystone-icons-react
```

or

```bash
yarn add @fe-infra/keystone-icons-react
```

or

```bash
pnpm add @fe-infra/keystone-icons-react
```

## Usage

### Basic Usage

To use an icon from the library, import the desired icon component and use it in your JSX:

```jsx
import { KsIconHome } from '@fe-infra/keystone-icons-react';

function MyComponent() {
  return <KsIconHome />;
}
```

### Customizing Icons

You can customize the appearance of the icons using props:

```jsx
import { KsIconHome } from '@fe-infra/keystone-icons-react';

function MyComponent() {
  return <KsIconHome size="sm" color="#007bff" />;
}
```

#### Available Attributes

- **size**: Sets the width and height of the icon (default: 24)
- **color**: Sets the color of the icon (default: currentColor)

## License

`@fe-infra/keystone-icons-react` is released under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Support

If you encounter any issues or have questions about `@fe-infra/keystone-icons-react`, please file an issue on our [Codebase repository](https://code.byted.org/ad/byted-web-components/issues) or join our [Lark group chat](https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=d2fj9cdd-181d-4454-9d61-d7c4c7i7f7l8).

## Acknowledgements

`@fe-infra/keystone-icons-react` is built with Stencil.js, a powerful toolchain for building reusable, scalable web components.
