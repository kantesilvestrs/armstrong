import * as React from "react"

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from "@storybook/addon-info";
import { Button } from '../_symlink/components/interaction/button';
import { Icon } from "../_symlink";

import "../theme/theme.scss";

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with icon', () => (
    <Button leftIcon={Icon.Icomoon.rocket} onClick={action('clicked')}>
      Launch rocket
      </Button>
  ))