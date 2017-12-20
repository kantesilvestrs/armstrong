import * as React from "react";
import { IFormInputHTMLProps, generateUniqueId } from "../form";
import { ClassHelpers } from "../../../utilities/classNames";
import { DataValidationMessage } from '../formCore';

export interface IRadioInputProps extends IFormInputHTMLProps<RadioInput, React.InputHTMLAttributes<HTMLInputElement>> {
  labelContent: string | React.ReactElement<any>;
}

export class RadioInput extends React.Component<IRadioInputProps, {}> {
  static defaultProps: Partial<IRadioInputProps> = {
    validationMode: "none"
  }

  private input: HTMLInputElement;

  public focus() {
    if (this.input) {
      this.input.focus()
    }
  }

  public blur() {
    if (this.input) {
      this.input.blur()
    }
  }

  render() {
    const validationMessage = DataValidationMessage.get(this.props)
    const { labelContent, validationMode, ...attrs } = this.props
    const id = generateUniqueId(u => "radio_" + u);
    const classes = ClassHelpers.classNames(
      "armstrong-input",
      "radio",
      this.props.className,
      {
        "show-validation": (validationMode !== "none" && validationMessage)
      }
    );
    return (
      <div className={classes} title={validationMessage}>
        <input id={id} { ...attrs } ref={i => this.input = i} type="radio" {...DataValidationMessage.spread(validationMessage) } />
        <label htmlFor={id} />
        <label className="radio-label" htmlFor={id}>{labelContent}</label>
      </div>
    );
  }
}
