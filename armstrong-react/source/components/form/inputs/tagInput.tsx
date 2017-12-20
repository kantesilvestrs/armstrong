import * as React from "react";
import * as _ from "underscore";
import { IFormInputHTMLProps } from "../form";
import { Icon } from "./../../display/icon";
import { ValidationLabel } from "../validationWrapper";
import { ClassHelpers } from "../../../utilities/classNames";
import { DataValidationMessage } from '../formCore';

export type ITagInputProps = IFormInputHTMLProps<TagInput, React.InputHTMLAttributes<HTMLInputElement>> & {
  suggestions?: string[];
  onChange?: (tags: string[]) => void;
  value?: string[];
};

export class TagInput extends React.Component<ITagInputProps, { tags: string[]; suggestions: string[], suggestionIndex: number }> {
  static defaultProps: Partial<ITagInputProps> = {};
  public input: HTMLInputElement | HTMLTextAreaElement;
  constructor(props) {
    super(props);
    this.state = { tags: [], suggestions: [], suggestionIndex: -1 };
  }

  public focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  public blur() {
    if (this.input) {
      this.input.blur();
    }
  }

  componentWillReceiveProps(nextProps: ITagInputProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ tags: nextProps.value || [] });
    }
  }

  componentWillMount() {
    this.setState({ tags: this.props.value || [] });
  }

  findOne(haystack: any[], arr: any[]) {
    return arr.some(function (v) {
      return haystack.indexOf(v) >= 0;
    });
  }

  private onKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    let input = e.target;
    let value = input["value"];
    switch (e.keyCode) {
      case 40: // ArrowDown
      case 38: // ArrowUp}
        return
      case 13:
        if (value) {
          if (this.state.tags.indexOf(value) === -1) {
            let tags = [...this.state.tags, value];
            this.notifyTagsChange(tags)
          }
          input["value"] = "";
          return;
        }
        break;
    }

    if (value) {
      this.notifySuggestionsChange(this.filterSuggestions(value));
    } else {
      this.notifySuggestionsChange();
    }
  }

  private makeComparison(value: string){
    return value ? value.trim().toLowerCase() : ""
  }

  private filterSuggestions(value: string){
    value = this.makeComparison(value)
    if (!value){
      return []
    }

    let filteredSuggestions = this.props.suggestions.filter(s => this.makeComparison(s).lastIndexOf(value, 0) === 0);
    return filteredSuggestions.filter(s => this.state.tags.indexOf(s) === -1);
  }

  private onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    let input = e.target;
    let value = input["value"];
    const { suggestionIndex, suggestions } = this.state

    switch (e.keyCode) {
      case 8: // delete
        if (this.state.tags.length !== 0 && !value) {
          let tags = _.clone(this.state.tags);
          tags.splice(-1, 1);
          this.notifyTagsChange(tags)
        }

        break;
      case 40: // ArrowDown
        if (suggestionIndex < suggestions.length - 1) {
          this.setState({ suggestionIndex: suggestionIndex + 1 })
        }
        e.preventDefault()
        break
      case 38: // ArrowUp}
        if (suggestionIndex > -1) {
          this.setState({ suggestionIndex: suggestionIndex - 1 })
        }
        e.preventDefault()
        break
      case 13:
        const suggestion = suggestions[suggestionIndex]
        if (suggestion) {
          this.addTag(suggestion)
        }
        break;
    }
  }

  addTag(tag: string) {
    let tags = [...this.state.tags, tag];
    this.notifyTagsChange(tags)
    this.input.value = "";
    this.input.focus();
  }

  removeTag(index: number) {
    let tags = _.clone(this.state.tags);
    tags.splice(index, 1);
    this.notifyTagsChange(tags)
    this.input.focus();
  }

  private notifyTagsChange = (tags: string[]) => {
    this.setState({ tags, suggestions: [] })
    this.props.onChange(tags)
  }

  private notifySuggestionsChange = (suggestions: string[] = []) => {
    this.setState({ suggestions, suggestionIndex: -1 })
  }

  private renderSuggestions(suggestions: string[]) {
    if (!suggestions || !suggestions.length) {
      return null
    }
    return <div className="suggestions">{suggestions.map((s, i) => <div key={s} className={ClassHelpers.classNames({ selected: i === this.state.suggestionIndex })} onClick={() => this.addTag(s)}>{s}</div>)}</div>
  }

  render() {
    const validationMessage = DataValidationMessage.get(this.props)
    var classes = ClassHelpers.classNames("armstrong-input", "tag-input", this.props.className, {
      "show-validation": this.props.validationMode !== "none" && validationMessage
    });
    return (
      <div className={classes}>
        {this.state.tags.map((t, i) => (
          <div key={t} className="tag">
            {t}
            <Icon icon={Icon.Icomoon.cross} onClick={() => this.removeTag(i)} />
          </div>
        ))}
        <input onKeyDown={e => this.onKeyDown(e)} ref={r => (this.input = r)} onKeyUp={e => this.onKeyUp(e)} type="text" />
        {this.renderSuggestions(this.state.suggestions)}
        <ValidationLabel message={validationMessage} mode={this.props.validationMode} />
      </div>
    );
  }
}
