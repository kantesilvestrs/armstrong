import * as _ from "underscore";
import * as React from "react";
import {Form} from "../form";

export interface ISelectInputProps extends React.HTMLProps<SelectInput> {
  options: { id: number, name: string }[];
}

export class SelectInput extends React.Component<ISelectInputProps, {}> {
    render() {
        return (
          <div className="select-input">
            <select {...this.props as any}>
            {this.props.options.map(op => <option value={op.id.toString()}>{op.name}</option>)}
            </select>
            </div>
        );
    }
}
