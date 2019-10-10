import * as React from 'react';

import { storiesOf } from '@storybook/react';

import '../theme/theme.scss';

import { SwitchInput } from '../_symlink/components/form/inputs/switchInput';
import { Icon } from '../_symlink';

storiesOf('Switch', module)
  .addParameters({
    options: {
      showAddonPanel: true
    }
  })
  .add('Simple Switch', () => (
    <div>
      <SwitchInput />
      <br />
      <br />
      <SwitchInput width={120} height={90} padding={10} hoverNudgeAmount={10} />
      <br />
      <br />
      <SwitchInput width={400} height={60} padding={3} hoverNudgeAmount={10} />
      <br />
      <br />
      <SwitchInput
        width={80}
        height={50}
        padding={0}
        hoverNudgeAmount={0}
        inactiveColour='red'
        activeColour='green'
        hoveringColour='red'
      />
      <br />
      <br />
      <SwitchInput width={50} height={10} padding={-10} activeColour='blue' />
      <br />
      <br />
      <p>
        Sizes and colours can be defined in props, but if you're into seperation
        of concerns and would rather do it in scss, there's a couple mixins for
        handling them.
      </p>
      <br />
      <p>
        @mixin resize-switch($switch-width, $switch-height, $switch-padding,
        $switch-hover-nudge-amount)
      </p>
      <p>
        @mixin recolour-switch($switch-inactive-colour, $switch-hover-colour,
        $switch-active-colour)
      </p>
      <br />
      <br />
      <p>
        If you're only using css, the following vanilla css variables can be
        defined to style all switches
      </p>
      <p>--armstrong-switch-height</p>
      <p>--armstrong-switch-width</p>
      <p>--armstrong-switch-padding</p>
      <p>--armstrong-switch-hover-nudge-amount</p>
      <p>--armstrong-switch-inactive-colour</p>
      <p>--armstrong-switch-hover-colour</p>
      <p>--armstrong-switch-active-colour</p>
    </div>
  ))
  .add('Switch with Icons', () => (
    <div>
    <SwitchInput
      width={80}
      height={50}
      padding={0}
      hoverNudgeAmount={5}
      inactiveColour='red'
      activeColour='green'
      hoveringColour='red'
      activeIcon={Icon.Icomoon.checkmark3}
      inactiveIcon={Icon.Icomoon.cross2}
    />
    </div>
  ))