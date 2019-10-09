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
        style={{ margin: '40px' }}
        width={80}
        height={50}
        padding={4}
        hoverNudgeAmount={5}
        iconSize={0.8}
        inactiveColour='red'
        activeColour='green'
        hoveringColour='red'
        activeIcon={Icon.Icomoon.checkmark3}
        inactiveIcon={Icon.Icomoon.cross2}
      />

      <SwitchInput
        style={{ margin: '40px' }}
        width={45}
        height={30}
        padding={2}
        iconSize={0.9}
        inactiveColour='lightgray'
        activeColour='purple'
        hoveringColour='lightgray'
        activeIcon={Icon.Icomoon.eye3}
        inactiveIcon={Icon.Icomoon.eyeBlocked3}
      />

      <SwitchInput
        style={{ margin: '40px' }}
        width={70}
        height={50}
        padding={1}
        iconSize={0.6}
        inactiveColour='lightgray'
        activeColour='red'
        hoveringColour='lightgray'
        activeIcon={Icon.Icomoon.warning}
      />

      <SwitchInput
        style={{ margin: '40px' }}
        width={65}
        height={40}
        padding={1}
        iconSize={0.6}
        inactiveColour='gray'
        activeColour='blue'
        hoveringColour='gray'
        inactiveIcon={Icon.Icomoon.micOff}
        activeIcon={Icon.Icomoon.mic}
      />

      <SwitchInput
        style={{ margin: '40px' }}
        width={75}
        height={20}
        padding={-20}
        iconSize={0.6}
        inactiveColour='gray'
        activeColour='blue'
        hoveringColour='gray'
        inactiveIcon={Icon.Icomoon.glass2}
        activeIcon={Icon.Icomoon.glass}
      />
    </div>
  ));
