# armstrong-react

Armstrong React - [Rocketmakers](http://www.rocketmakers.com/) React component library.

## Introduction

A library of components for React/SCSS interface development.

>The Rokot platform components heavily rely on usage of the [typings](https://github.com/typings/typings) utility for typescript definitions management.
If you don't have `typings` installed:
```
npm i typings -g
```

## Getting Started

>WARNING!: This library assumes you're using React and SASS.

### Installation
Install via `npm`
```
npm i armstrong-react --save
```

### Typings

You will need to install these ambient dependencies:
>NOTE: you may already have some of these ambient dependencies installed!

```
typings install react underscore classnames node -SA
```

## Importing the SCSS

To make use of the default styles, you'll need to import a single SCSS entry point from the module into your root stylesheet. The simplest way of achieving this is to use [webpack](https://webpack.github.io)'s [sass-loader](https://github.com/jtangelder/sass-loader) plugin and add the following line to your root SCSS file:
```scss
@import "~armstrong-react/dist/style";
```
>NOTE: If you're not using webpack, you can use an absolute or relative path through your node_modules folder.

## Example: Adding a simple Armstrong Button (TypeScript/JSX):

```javascript
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Button } from "armstrong-react";

export class MyComponent extends React.Component<{}, {}> {

  private buttonClicked(e) {
    console.log('Clicked!')
  }

  public render() {
    return (
      <main>
        <h1>Below is a button!</h1>
        <Button text="Armstrong lives!" condition="info" onClick={ this.buttonClicked } />
      </main>
    );
  }
}
```

## Workbench folder?
Don't worry about this ;)

## Consumed Libraries

#### [Underscore](http://underscorejs.org)
#### [Classnames](https://github.com/JedWatson/classnames)
