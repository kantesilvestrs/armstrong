import * as React from "react";
import * as _ from "underscore";
import { Formatting } from "../../utilities/formatting";
import { FormBinderBase } from "./formBinderBase";
import { IDataBinder, IFormBinder, IFormBinderInjector, updateFormBinderInjector } from "./formCore";
import { CheckboxValueConverter, DefaultValueConverter, IInputValueConverter, INumericOptions, IValueConverter, MultipleNumericValueConverter, NumericValueConverter } from "./formValueConverters";
import { IAutoCompleteInputProps, IAutoCompleteOption } from "./inputs/autoCompleteInput";
import { ICalendarInputProps } from "./inputs/calendarInput";
import { ICodeInputProps } from "./inputs/codeInput";
import { IDateInputProps } from "./inputs/dateInput";
import { ITagInputProps } from "./inputs/tagInput";
import { ITimeInputProps } from "./inputs/timeInput";
import { IArrayProp, PropertyPath, PropertyPathFor } from "./propertyPathBuilder";

/** An input FormBinder that sets native 'value' and 'onChange: (e) => void' properties */
export class InputFormBinder<TDataPropValue, TComponentPropValue> extends FormBinderBase<React.DOMAttributes<{}>, TDataPropValue, TComponentPropValue> {
  setElementProperty(props: React.DOMAttributes<any>, dataBinder: IDataBinder<any>) {
    super.setElementProperty(props, dataBinder);
    const v = props[this.propertySet];
    if (Formatting.isNullOrUndefined(v)) {
      props[this.propertySet] = this.getDefaultInputValue();
    }
  }

  protected getDefaultInputValue(): any {
    return "";
  }

  handleValueChanged(props: React.DOMAttributes<any>, dataBinder: IDataBinder<any>, notifyChanged: () => void) {
    props.onChange = e => {
      this.onChanged(dataBinder, e.currentTarget[this.propertyGet], notifyChanged);
    };
  }
}

export class SelectMultipleFormBinder<TDataProp> extends InputFormBinder<TDataProp, string[]> {
  constructor(dataPath: string, valueConverter?: IValueConverter<TDataProp, string[]>) {
    super(dataPath, "value", valueConverter);
  }

  setElementProperty(props: React.DOMAttributes<any>, dataBinder: IDataBinder<any>) {
    super.setElementProperty(props, dataBinder);
    // tslint:disable-next-line:no-string-literal
    props["multiple"] = true;
  }

  handleValueChanged(props: React.DOMAttributes<any>, dataBinder: IDataBinder<any>, notifyChanged: () => void) {
    props.onChange = e => {
      this.onChanged(dataBinder, this.getSelectValues(e.currentTarget), notifyChanged);
    };
  }

  private getSelectValues(select) {
    const result: string[] = [];
    const options = select && select.options;
    if (!options) {
      return result;
    }
    for (const opt of options) {
      if (opt.selected) {
        result.push(opt.value);
      }
    }
    return result;
  }
}

export class CheckboxFormBinder<TDataPropValue, TComponentPropValue> extends InputFormBinder<TDataPropValue, TComponentPropValue> {
  constructor(dataPath: string, valueConverter?: IValueConverter<TDataPropValue, TComponentPropValue>) {
    super(dataPath, "checked", valueConverter);
  }
  protected getDefaultInputValue() {
    return false;
  }
}

/** A radio input FormBinder */
export class RadioFormBinder<TDataPropValue, TComponentPropValue> extends InputFormBinder<TDataPropValue, TComponentPropValue> {
  setElementProperty(props: React.DOMAttributes<any>, dataBinder: IDataBinder<any>) {
    // tslint:disable-next-line:no-string-literal
    props["name"] = this.dataPath;
    props[this.propertySet] = this.convert(dataBinder.getValue(this.dataPath)) === props[this.propertyGet];
  }
}

export class DateInputFormBinder extends FormBinderBase<IDateInputProps, string, string> {
  constructor(dataPath: string) {
    super(dataPath, "date");
  }

  handleValueChanged(props: IDateInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void) {
    props.onChange = e => {
      this.onChanged(dataBinder, e, notifyChanged);
    };
  }
}

export class TimeInputFormBinder extends FormBinderBase<ITimeInputProps, string, string> {
  constructor(dataPath: string) {
    super(dataPath, "time");
  }
  static customValue(dataName: string) {
    return new TimeInputFormBinder(dataName);
  }

  handleValueChanged(props: ITimeInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void) {
    props.onChange = e => {
      this.onChanged(dataBinder, e, notifyChanged);
    };
  }
}

export class CalendarInputFormBinder extends FormBinderBase<ICalendarInputProps, string, string> {
  constructor(dataPath: string) {
    super(dataPath, "date");
  }

  static customValue(dataName: string) {
    return new CalendarInputFormBinder(dataName);
  }

  handleValueChanged(props: ICalendarInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void) {
    props.onDateChanged = e => this.onChanged(dataBinder, e, notifyChanged);
  }
}

export class AutoCompleteFormBinder implements IFormBinder<IAutoCompleteInputProps, any> {
  constructor(public dataPath: string, private getItemFromId?: (id: string) => IAutoCompleteOption) { }
  setElementProperty(props: IAutoCompleteInputProps, dataBinder: IDataBinder<any>): void {
    const value = dataBinder.getValue(this.dataPath);
    if (_.isArray(value)) {
      if (this.getItemFromId) {
        props.value = value.map(v => this.getItemFromId(v));
        return;
      }
      props.value = props.options ? props.options.filter(o => value.indexOf(o.id) > -1) : [];
      return;
    }
    if (this.getItemFromId) {
      props.value = this.getItemFromId(value);
      return;
    }

    props.value = props.options && props.options.filter(o => value === o.id)[0];
  }

  handleValueChanged(props: IAutoCompleteInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void): void {
    props.onSelected = c => {
      if (_.isArray(c)) {
        dataBinder.setValue(this.dataPath, c.map(cc => cc.id));
      } else {
        dataBinder.setValue(this.dataPath, c.id);
      }
      notifyChanged();
    };
  }
}

export class TagInputFormBinder implements IFormBinder<ITagInputProps, any> {
  constructor(public dataPath: string) { }
  setElementProperty(props: ITagInputProps, dataBinder: IDataBinder<any>): void {
    const value = dataBinder.getValue(this.dataPath);
    props.value = value;
  }

  handleValueChanged(props: ITagInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void): void {
    props.onChange = tags => {
      dataBinder.setValue(this.dataPath, tags);
      notifyChanged()
    };
  }
}

export class CodeInputFormBinder implements IFormBinder<ICodeInputProps, any> {
  constructor(public dataPath: string) { }
  // set the value property of the `SelectInput`
  setElementProperty(props: ICodeInputProps, dataBinder: IDataBinder<any>): void {
    props.value = dataBinder.getValue(this.dataPath);
  }
  // handle the change property of the `SelectInput` - setting the dataBinder value and notifying on change
  handleValueChanged(props: ICodeInputProps, dataBinder: IDataBinder<any>, notifyChanged: () => void): void {
    props.onChange = c => {
      dataBinder.setValue(this.dataPath, c);
      notifyChanged();
    };
  }
}

class ChildrenBinder<TValue, TProps = HTMLElement> implements IFormBinder<TProps, any> {
  constructor(public dataPath: string, private childrenFactory: (value: TValue, props?: TProps, dataBinder?: IDataBinder<any>) => React.ReactNode) { }
  setElementProperty(props: TProps, dataBinder: IDataBinder<any>): void {
    // Do nothing
  }

  handleValueChanged(props: TProps, dataBinder: IDataBinder<any>, notifyChanged: () => void): void {
    // Do nothing
  }

  overrideChildren(props: TProps, dataBinder: IDataBinder<any>) {
    return this.childrenFactory(dataBinder.getValue(this.dataPath), props, dataBinder)
  }
}

type FormBinderKey<T, X = any> = Extract<keyof T, string> | PropertyPathFor<T, X>

function toString1<T>(param: FormBinderKey<T>) {
  if (typeof param === "string") {
    return param
  }

  return PropertyPath.for(param)
}

function toString<T>(param: FormBinderKey<T>, parentPath: string) {
  return parentPath ? `${parentPath}.${toString1(param)}` : toString1(param)
}

/** Form Binder helpers */
export class FormBinder<TDataBinder> {
  constructor(private parentPath?: string) { }

  createChildBinder1<X>(dataName: PropertyPathFor<TDataBinder, X>) {
    type A = ReturnType<PropertyPathFor<TDataBinder, X>>
    return new FormBinder<A extends IArrayProp<X> ? X[] : X>(PropertyPath.for(dataName))
  }

  createChildBinder<TKey extends Extract<keyof TDataBinder, string>>(dataName: TKey) {
    return new FormBinder<TDataBinder[TKey]>(dataName)
  }

  /** bind a custom form binder */
  custom<P>(formBinder: IFormBinder<P, any>): IFormBinderInjector<P> {
    return updateFormBinderInjector({} as any, formBinder);
  }

  /** Override the children of the React element - used for label binding */
  children<TValue, TProps = HTMLElement>(dataName: FormBinderKey<TDataBinder>, childrenFactory: (value: TValue, props?: TProps, dataBinder?: IDataBinder<any>) => React.ReactNode) {
    return this.custom(new ChildrenBinder<TValue, TProps>(toString(dataName, this.parentPath), childrenFactory));
  }

  /** bind to a 'hidden' input */
  hidden<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.defaultInputFormBinder(dataName, "hidden", valueConverter);
  }

  /** bind a string property to a 'password' input */
  password<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.defaultInputFormBinder(dataName, "password", valueConverter);
  }

  /** bind a string property to a 'text' input */
  text<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.defaultInputFormBinder(dataName, "text", valueConverter);
  }

  /** bind a string property to a 'email' input */
  textEmail<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.defaultInputFormBinder(dataName, "email", valueConverter);
  }

  autoCompleteInput(dataName: FormBinderKey<TDataBinder>, getItemFromId?: (id: string) => IAutoCompleteOption) {
    return this.custom(new AutoCompleteFormBinder(toString(dataName, this.parentPath), getItemFromId));
  }

  /** bind a 'value' string array property to a TagInput (e.g. ["cool", "guys", "only"]) */
  tagInput(dataName: FormBinderKey<TDataBinder>) {
    return this.custom(new TagInputFormBinder(toString(dataName, this.parentPath)));
  }

  codeInput(dataName: FormBinderKey<TDataBinder>) {
    return this.custom(new CodeInputFormBinder(toString(dataName, this.parentPath)));
  }

  /** bind a 'date' string property to a CalendarInput (e.g. YYYY-MM-DD) */
  calendarInput(dataName: FormBinderKey<TDataBinder>) {
    return this.custom(new CalendarInputFormBinder(toString(dataName, this.parentPath)));
  }

  /** bind a 'date' string property to a DateInput (e.g. YYYY-MM-DD) */
  dateInput(dataName: FormBinderKey<TDataBinder>) {
    return this.custom(new DateInputFormBinder(toString(dataName, this.parentPath)));
  }

  /** bind a 'time' string property to a TimeInput (e.g. HH:MM) */
  timeInput(dataName: FormBinderKey<TDataBinder>) {
    return this.custom(new TimeInputFormBinder(toString(dataName, this.parentPath)));
  }

  private defaultInputFormBinder<TDataPropValue, TTo>(dataName: FormBinderKey<TDataBinder>, type: string, valueConverter?: IValueConverter<TDataPropValue, TTo>, propertySet = "value") {
    const adaptorInjector = this.custom(new InputFormBinder(toString(dataName, this.parentPath), propertySet, valueConverter));
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["type"] = type;
    return adaptorInjector;
  }

  /** bind a number property to a range */
  range(dataName: FormBinderKey<TDataBinder>, options?: INumericOptions) {
    const adaptorInjector = this.custom(new InputFormBinder(toString(dataName, this.parentPath), "value"));
    if (options) {
      // tslint:disable-next-line:no-string-literal
      adaptorInjector["min"] = options.min;
      // tslint:disable-next-line:no-string-literal
      adaptorInjector["max"] = options.max;
      // tslint:disable-next-line:no-string-literal
      adaptorInjector["step"] = options.step || 1;
    }
    return adaptorInjector;
  }

  /** uncontrolled text input */
  defaultText<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.custom(new InputFormBinder(toString(dataName, this.parentPath), "defaultValue", valueConverter, "value"));
  }

  /** bind a number property to a 'text' input */
  textNumeric(dataName: FormBinderKey<TDataBinder>, options?: INumericOptions) {
    const converter = options ? new NumericValueConverter(options) : NumericValueConverter.instance;
    const adaptorInjector = this.custom(new InputFormBinder(toString(dataName, this.parentPath), "defaultValue", converter, "value"));
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["type"] = "number";
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["onKeyDown"] = e => KeyboardHelper.numericKeyPress(e, options);
    if (options) {
      // tslint:disable-next-line:no-string-literal
      adaptorInjector["min"] = options.min;
      // tslint:disable-next-line:no-string-literal
      adaptorInjector["max"] = options.max;
    }
    return adaptorInjector;
  }

  /** bind a TDataPropValue property to a select */
  selectCustom<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IInputValueConverter<TDataPropValue>) {
    return this.custom(new InputFormBinder(toString(dataName, this.parentPath), "value", valueConverter));
  }

  /** bind a string property to a select */
  select(dataName: FormBinderKey<TDataBinder>) {
    return this.selectCustom(dataName, DefaultValueConverter.instance);
  }

  /** bind a number property to a select */
  selectNumeric(dataName: FormBinderKey<TDataBinder>) {
    return this.selectCustom(dataName, NumericValueConverter.instance);
  }

  /** bind a TDataPropValue[] property to a multi select */
  selectMultipleCustom<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IValueConverter<TDataPropValue, string[]>) {
    return this.custom(new SelectMultipleFormBinder(toString(dataName, this.parentPath), valueConverter));
  }

  /** bind a string[] property to a multi select */
  selectMultiple(dataName: FormBinderKey<TDataBinder>) {
    return this.selectMultipleCustom(dataName);
  }

  /** bind a number[] property to a multi select */
  selectMultipleNumeric(dataName: FormBinderKey<TDataBinder>) {
    return this.selectMultipleCustom(dataName, MultipleNumericValueConverter.instance);
  }

  /** bind a TDataPropValue property to a 'checkbox' input */
  checkboxCustom<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, valueConverter?: IValueConverter<TDataPropValue, boolean>) {
    const adaptorInjector = this.custom(new CheckboxFormBinder(toString(dataName, this.parentPath), valueConverter));
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["type"] = "checkbox";
    return adaptorInjector;
    // return this.defaultInputFormBinder(dataName, "checkbox", valueConverter, "checked")
  }

  /** bind a boolean property to a 'checkbox' input */
  checkbox(dataName: FormBinderKey<TDataBinder>) {
    return this.checkboxCustom(dataName);
  }

  /** bind a TDataPropValue property to a 'radio' input, using trueValue and falseValue equality testing */
  checkboxConvert<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, trueValue: TDataPropValue, falseValue: TDataPropValue) {
    return this.checkboxCustom(dataName, new CheckboxValueConverter(trueValue, falseValue));
  }

  /** bind a TDataPropValue property to a 'radio' input */
  radioCustom<TDataPropValue>(dataName: FormBinderKey<TDataBinder>, value: string, valueConverter: IInputValueConverter<TDataPropValue>) {
    const adaptorInjector = this.custom(new RadioFormBinder(toString(dataName, this.parentPath), "checked", valueConverter, "value"));
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["type"] = "radio";
    // tslint:disable-next-line:no-string-literal
    adaptorInjector["value"] = value;
    return adaptorInjector;
  }

  /** bind a string property to a 'radio' input */
  radio(dataName: FormBinderKey<TDataBinder>, value: string) {
    return this.radioCustom(dataName, value, DefaultValueConverter.instance);
  }

  /** bind a number property to a 'radio' input */
  radioNumeric(dataName: FormBinderKey<TDataBinder>, value: number) {
    return this.radioCustom(dataName, value.toString(), NumericValueConverter.instance);
  }
}

class KeyboardHelper {
  private static getNumericRegEx(options?: INumericOptions) {
    if (options) {
      if (options.allowNegative) {
        if (options.decimals) {
          return /[\d\.\-]/;
        }
        return /[\d\-]/;
      }

      if (options.decimals) {
        return /[\d\.]/;
      }
    }

    return /\d/;
  }

  static numericKeyPress(e: React.KeyboardEvent<{}>, options?: INumericOptions) {
    const element = e.currentTarget as HTMLInputElement;
    const value = element.value;

    if (e.keyCode === 189 && value.indexOf("-") !== -1) {
      e.preventDefault();
      return;
    }
    if (e.keyCode === 190 && value.indexOf(".") !== -1) {
      e.preventDefault();
      return;
    }
  }
}
