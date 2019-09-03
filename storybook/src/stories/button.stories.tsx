import * as React from "react"

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button, Icon } from "../_symlink";


import "../theme/theme.scss";

storiesOf('Button', module)
  .add('Standard', () =>
    <Button onClick={action('clicked')}>Hello Button</Button>
  )
  .add('Themed with shadow', () =>
    <Button className="bg-warning shadow" onClick={action('clicked')}>Hello Button</Button>
  )
  .add('Left icon', () =>
    <Button leftIcon={Icon.Icomoon.rocket} onClick={action('clicked')}>Launch rocket</Button>
  )