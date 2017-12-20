import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "underscore";
import * as moment from "moment";
import { IFormInputHTMLProps } from "../form";
import { IValueConverter } from "../formValueConverters";
import { DateHelpers } from '../../../utilities/dateHelpers';
import { Grid, Row, Col } from "../../layout/grid";
import { Icon } from '../../display/icon';
import { isLocaleSet } from "../../../config/config"
import { ValidationLabel } from "../validationWrapper";
import { ClassHelpers } from "../../../utilities/classNames";
import { DataValidationMessage } from '../formCore';

export interface ICalendarInputProps extends IFormInputHTMLProps<CalendarInput, React.InputHTMLAttributes<HTMLInputElement>> {
  date?: string;
  format?: string;
  min?: string;
  max?: string;
  onDateChanged?: (date: string) => void;
  alwaysShowCalendar?: boolean;
  nativeInput?: boolean;
  icon?: string;
  disabled?: boolean;
  disableClear?: boolean;
}

export interface ICalendarInputState {
  inputValue?: string;
  selectedMonthStart?: moment.Moment;
  pickerBodyVisible?: boolean;
  showOnTop?: boolean;
  calendarOffset?: number;
}

const isoFormat = "YYYY-MM-DD";

export class CalendarInput extends React.Component<ICalendarInputProps, ICalendarInputState> {

  private format: string;

  private inputElement: HTMLInputElement;
  private bodyElement: HTMLDivElement;

  static defaultProps: Partial<ICalendarInputProps> = {
    format: 'L',
    validationMode: "none"
  }

  constructor(props: ICalendarInputProps) {
    super(props);
    if (!isLocaleSet()) {
      console.warn("Using CalendarInput without setting the global Armstrong locale is not recommended. See https://github.com/Rocketmakers/armstrong-react#form---calendar--datepickers")
    }

    this.format = this.props.nativeInput ? isoFormat : props.format;
    const initialDate = props.date ? moment(props.date, isoFormat, true) : null;
    let inputValue = "";
    let selectedMonthStart = moment().startOf('month');
    if (initialDate) {
      inputValue = initialDate.format(this.format);
      selectedMonthStart = initialDate.clone().startOf('month');
    }
    this.state = { inputValue, pickerBodyVisible: false, showOnTop: false, calendarOffset: 0, selectedMonthStart };
  }

  onDaySelected(date: moment.Moment) {
    if (!this.fallsWithinRange(date)) {
      return;
    }
    const newDate = date.clone();
    this.setState({ pickerBodyVisible: false, inputValue: newDate.format(this.format) });
    if (this.props.onDateChanged) {
      this.props.onDateChanged(newDate.format(isoFormat));
    }
  }

  isEndOfMonth(date: moment.Moment): boolean {
    const endOfMonth = date.clone().endOf('month');
    return endOfMonth.isSame(date, 'day');
  }

  fallsWithinRange(date: moment.Moment) {
    if (this.props.min && date.isBefore(moment(this.props.min, isoFormat, true), 'day')) {
      return false;
    }
    if (this.props.max && date.isAfter(moment(this.props.max, isoFormat, true), 'day')) {
      return false;
    }
    return true;
  }
  calcTop() {
    if (this.inputElement) {
      var bounds = this.inputElement.getBoundingClientRect();
      this.setState({ calendarOffset: bounds.bottom });
    }
  }

  getDaysInMonth() {
    const days = [];
    const a = this.state.selectedMonthStart.clone().startOf('month').startOf('day');
    const b = a.clone().endOf('month');
    let firstDay = false;

    for (const m = moment(a); m.isBefore(b); m.add(1, 'days')) {
      if (!firstDay) {
        firstDay = true;
        const firstDayIndex = m.weekday();
        for (let i = firstDayIndex; i > 0; i--) {
          days.push(this.getDayComponent(true, this.onDaySelected.bind(this), m.clone().subtract(i, 'days')));
        }
      }
      days.push(this.getDayComponent(false, this.onDaySelected.bind(this), m.clone()));
      if (this.isEndOfMonth(m)) {
        const lastDayIndex = m.weekday();
        for (let i = 1; i < 7 - lastDayIndex; i++) {
          days.push(this.getDayComponent(true, this.onDaySelected.bind(this), m.clone().add(i, 'days')));
        }
      }
    }
    return days;
  }

  getDayComponent(notInCurrentMonth: boolean, dayClicked: (d: moment.Moment) => void, date: moment.Moment) {
    const d = date.clone();
    const dateWithinRange = this.fallsWithinRange(d);
    const isSelected = d.format(isoFormat) === this.props.date;
    const isToday = d.clone().startOf('day').isSame(moment().startOf('day'));
    return <CalendarDay
      key={`Calendar_day_${date.format('DDMMYYYY')}`}
      selected={isSelected}
      isToday={isToday}
      withinRange={dateWithinRange}
      notInCurrentMonth={notInCurrentMonth}
      dayClicked={dayClicked}
      date={d} />;
  }

  changeMonth(increment: number) {
    this.setState({ selectedMonthStart: this.state.selectedMonthStart.clone().add(increment, 'months') }, () => {
      this.shouldShowOnTop();
    });
  }

  checkDate(dateString: string) {
    if (dateString === this.state.inputValue) {
      return;
    }
    const m = moment(dateString, this.format, false);
    if (m.isValid() && this.fallsWithinRange(m)) {
      const formattedDate = m.format(this.format);
      if (this.props.onDateChanged) {
        this.props.onDateChanged(m.format(isoFormat));
      }
    }
    else {
      this.resetState(this.props);
    }
  }

  componentWillUnmount() {
    var f: EventListenerOrEventListenerObject;
    if (!this.props.nativeInput) {
      window.removeEventListener('mousedown', this);
    }
  }

  componentDidMount() {
    if (!this.props.nativeInput) {
      window.addEventListener('mousedown', this);
    }
  }

  componentWillReceiveProps(nextProps: ICalendarInputProps): void {
    if (this.props.date !== nextProps.date) {
      this.resetState(nextProps);
    }
  }

  handleEvent(e: Event) {
    const domNode = ReactDOM.findDOMNode(this);
    if (domNode.contains(e.target as Node) && e.type !== "mousewheel" && e.type !== "keydown") {
      return;
    }
    if (e.type === "keydown" && e["keyCode"] !== 9) {
      return;
    }
    document.removeEventListener("mousewheel", this, false);
    if (!this.state.inputValue) {
      this.resetState(this.props);
    }
    else {
      this.setState({ pickerBodyVisible: false });
    }
  }

  resetState(props: Readonly<ICalendarInputProps>): void {
    const selectedDate = props.date ? moment(props.date, isoFormat, true) : null;
    if (selectedDate) {
      this.setState({
        pickerBodyVisible: false,
        inputValue: selectedDate.format(this.format),
        selectedMonthStart: selectedDate.clone().startOf('month')
      });
    } else {
      this.setState({
        pickerBodyVisible: false,
        inputValue: "",
        selectedMonthStart: moment().startOf('month')
      });
    }

  }

  onInputFocus() {
    document.addEventListener("mousewheel", this, false);
    this.calcTop();
    this.setState({ pickerBodyVisible: true }, () => {
      this.shouldShowOnTop();
    })
  }

  shouldShowOnTop(): boolean {
    if (this.props.nativeInput || !this.inputElement) {
      return;
    }
    const height = this.bodyElement.clientHeight + 50;
    const visibleBottom = (window.innerHeight + window.scrollY);
    const inputRect = this.inputElement.getBoundingClientRect();
    const remainingSpace = window.innerHeight - inputRect.bottom;
    if (remainingSpace < height) {
      this.setState({ showOnTop: true });
      return true;
    } else {
      this.setState({ showOnTop: false })
      return false;
    }
  }

  propsDateAsMoment(): moment.Moment {
    return moment(this.props.date, isoFormat, true);
  }

  render() {
    const validationMessage = DataValidationMessage.get(this.props)
    const { icon, placeholder, alwaysShowCalendar, disableClear, onDateChanged, className, disabled, validationMode, nativeInput, min, max, date } = this.props
    const { selectedMonthStart, pickerBodyVisible, showOnTop, inputValue, calendarOffset } = this.state
    const weekdays = _.range(0, 7).map(n => <div className="date-picker-week-day" key={`day_name_${n}`}>{moment().startOf('week').add(n, 'days').format('dd')}</div>)
    const days = this.getDaysInMonth();
    const currentDisplayDate = selectedMonthStart.format("MMMM - YYYY");
    const classes = ClassHelpers.classNames(
      "date-picker-body",
      {
        "date-picker-body-visible": pickerBodyVisible && !alwaysShowCalendar,
        "date-picker-top": showOnTop,
        "always-show-calendar": alwaysShowCalendar
      }
    );
    const rootClasses = ClassHelpers.classNames(
      "date-picker",
      "armstrong-input",
      className,
      {
        "has-icon": icon !== null,
        "disabled": disabled,
        "show-validation": (validationMode !== "none" && validationMessage)
      }
    );
    if (nativeInput) {
      return (
        <div className={rootClasses}>
          {icon && <Icon icon={icon} />}
          <input ref={i => this.inputElement = i}
            {...DataValidationMessage.spread(validationMessage) }
            type="date"
            min={min || ''}
            max={max || ''}
            onChange={e => this.checkDate(e.target["value"])}
            value={this.propsDateAsMoment().format(this.format)}
            placeholder={placeholder}
          />
        </div>
      )
    }
    return (
      <div className={rootClasses}>
        <Icon icon={icon || Icon.Icomoon.calendar2} />
        {!alwaysShowCalendar &&
          <input className="cal-input" ref={i => this.inputElement = i}
            {...DataValidationMessage.spread(validationMessage) }
            disabled={disabled}
            type="text"
            value={inputValue}
            onKeyDown={e => this.handleEvent(e.nativeEvent)}
            onFocus={e => this.onInputFocus()}
            onChange={e => { /* This noop handler is here to stop react complaining! */ }}
            placeholder={placeholder}
          />
        }
        {!alwaysShowCalendar && date && !disableClear &&
          <div className="clear-date-button" onClick={() => onDateChanged(null)}><Icon icon={Icon.Icomoon.cross} /></div>
        }
        <div ref={b => this.bodyElement = b} className={classes} style={{ top: `${calendarOffset}px` }}>
          <div className="date-picker-body-wrapper">
            <Grid className="date-picker-header">
              <Row>
                <Col onClick={() => this.changeMonth(-1)} width="auto">{`<`}</Col>
                <Col>{currentDisplayDate}</Col>
                <Col onClick={() => this.changeMonth(1)} width="auto">{`>`}</Col>
              </Row>
            </Grid>
            <div className="date-picker-days">
              {weekdays}
              {days}
            </div>
          </div>
        </div>
        <ValidationLabel message={validationMessage} mode={validationMode} />
      </div>
    )
  }
}

interface ICalendarDayProps extends React.Props<CalendarDay> {
  date: moment.Moment;
  dayClicked: (date: moment.Moment) => void;
  notInCurrentMonth?: boolean;
  selected?: boolean;
  withinRange?: boolean;
  isToday?: boolean;
}

class CalendarDay extends React.Component<ICalendarDayProps, {}> {
  render() {
    const { notInCurrentMonth, selected, isToday, withinRange, date, dayClicked } = this.props
    const classes = ClassHelpers.classNames(
      {
        "not-in-month": notInCurrentMonth,
        "selected-day": selected,
        "is-today": isToday,
        "day-disabled": !withinRange
      }
    );
    return <div className={classes} onClick={() => dayClicked(date)}>{date.format('DD')}</div>
  }
}
