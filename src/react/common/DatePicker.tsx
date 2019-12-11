import * as React from "react";
import * as ReactDOM from "react-dom";
import moment from "moment";
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  minDate?: string | moment.Moment;
  maxDate?: string | moment.Moment;
  handleChange: Function;
  error?: string;
  value: string | moment.Moment;
  customFormat?: string;
  scrollTop?: number;
  holder?: any;
  scrollItem?: any;
  style?: object;
}

interface State {
  show: boolean;
  touched: boolean;
  day: number | null;
  month: number;
  year: number;
}

const firstYear = moment()
  .subtract(100, "y")
  .year();

class DatePicker extends React.PureComponent<Props, State> {
  state = {
    show: false,
    touched: false,
    day: null,
    month: moment().month() + 1,
    year: moment().year()
  };

  wrapper = React.createRef();
  picker = React.createRef();

  calculateTop(element) {
    if (element) {
      return element.offsetTop + this.calculateTop(element.offsetParent);
    }
    return 0;
  }

  calculateLeft(element) {
    if (element) {
      return element.offsetLeft + this.calculateLeft(element.offsetParent);
    }
    return 0;
  }

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);

    if (this.props.value) {
      this.setState({
        touched: true,
        day: moment(this.props.value).date(),
        month: moment(this.props.value).month() + 1,
        year: moment(this.props.value).year()
      });
    }
  }

  componentDidUpdate() {
    if (this.state.show) {
      if (this.props.scrollItem && this.props.holder) {
        if (this.props.holder.current.scrollTop > this.props.scrollItem.current.offsetTop) {
          this.setState({ show: false });
        }
        if (
          this.props.holder.current.scrollTop + this.props.holder.current.offsetHeight <
          this.props.scrollItem.current.offsetTop + this.props.scrollItem.current.offsetHeight
        ) {
          this.setState({ show: false });
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);

    if (!domNode || !domNode.contains(e.target)) {
      this.setState({ show: false });
    }
  };

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ show: false });
    }
  };

  setDate = ({ day, month, year }) => {
    const value = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;

    if (
      (this.props.minDate && moment(value).isBefore(moment(this.props.minDate))) ||
      (this.props.maxDate && moment(value).isAfter(moment(this.props.maxDate)))
    ) {
      return;
    } else {
      this.setState({ show: false, day, year, month, touched: true });

      this.props.handleChange(value);
    }
  };

  handleMonthChange = e => {
    const [month, year] = e.target.value.split(" ");
    this.setState({ month, year, day: null, touched: true });
  };

  changeDate = (op: string) => {
    if (
      op == "subtract" &&
      (this.state.year <= firstYear ||
        (this.props.minDate &&
          moment(
            `${this.state.year}-${this.state.month > 10 ? "0" : ""}${this.state.month}-01`
          ).isBefore(moment(this.props.minDate))))
    ) {
      return;
    } else {
      this.setState(prevState => {
        let { month, year } = prevState;

        if (op == "add") {
          if (month == 12) {
            year++;
            month = 1;
          } else {
            month++;
          }
        } else {
          if (month == 1) {
            year--;
            month = 12;
          } else {
            month--;
          }
        }

        return { ...prevState, day: null, touched: true, month, year };
      });
    }
  };

  render() {
    const { touched, month, year } = this.state;
    const { minDate, maxDate } = this.props;

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dates = [];

    let startYear = firstYear;

    if (minDate) {
      startYear = moment(minDate).year();
    }

    if (this.state.show) {
      // prettier-ignore
      for (let i = startYear; i < moment().add(30, "y").year(); i++) {
      for (let j = 1; j <= 12; j++) {
        if(i == startYear && j < moment(minDate).month() + 1) {
          continue;
        }

        dates.push({
          month: j,
          year: i,
          label: `${moment(j, "MM").format("MMM")} ${moment(i, "YYYY").format("YYYY")}`
        });
      }
    }
    }
    const daysInMonth = moment(`${year}-${month}-1`, "YYYY-MM-D").daysInMonth();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year });
    }

    let firstDay = moment(`${year}-${month}-1`, "YYYY-MM-D")
      .startOf("month")
      .day();

    // Sunday will be 0
    if (firstDay == 0) {
      firstDay = 7;
    }

    const prevDays = [];
    const lastMonth = moment(`${year}-${month}-1`, "YYYY-MM-D").subtract(1, "M");
    const daysLastMonth = lastMonth.daysInMonth();

    for (let i = 0; i < firstDay - 1; i++) {
      prevDays.push({
        day: daysLastMonth - i,
        month: lastMonth.month() + 1,
        year: lastMonth.year()
      });
    }

    prevDays.reverse();
    const comingMonth = moment(`${year}-${month}-1`, "YYYY-MM-D").add(1, "M");
    const comingDays = [];
    const remainingCells = 49 - dayNames.length - prevDays.length - days.length;

    for (let i = 1; i <= remainingCells; i++) {
      comingDays.push({ day: i, month: comingMonth.month() + 1, year: comingMonth.year() });
    }

    const format = this.props.customFormat || "DD MMM YYYY";

    return (
      <div className="date-picker-wrapper" ref={this.wrapper}>
        <div className="date-picker" onClick={() => this.setState({ show: true })}>
          <i className="fal fa-calendar" />
          <span className="date-picker-text">
            {touched && this.props.value ? moment(this.props.value).format(format) : "Date"}
            {this.props.error && (
              <i title={this.props.error} className="error fal fa-exclamation-circle" />
            )}
          </span>
          <i className="fal fa-angle-down big-angle" />
        </div>

        {this.state.show && (
          <div
            ref={this.picker}
            className="date-picker-popup"
            style={
              this.props.style
                ? this.props.style
                : this.wrapper && {
                    position: "fixed",
                    top:
                      this.calculateTop(this.wrapper.current) +
                      50 -
                      ((this.props.holder && this.props.holder.current.scrollTop) || 0),
                    left:
                      this.calculateLeft(this.wrapper.current) +
                      this.wrapper.current!.offsetWidth -
                      16 -
                      156
                  }
            }>
            <div className="arrow-up" />

            <div className="date-picker-popup-header">
              <button onClick={() => this.changeDate("subtract")} className="naked-button">
                <i className="fal fa-angle-left" />
              </button>

              <span className="universal-select">
                <select value={`${month} ${year}`} onChange={this.handleMonthChange}>
                  {dates.map(date => (
                    <option
                      selected={date.month == month && date.year == year}
                      value={`${date.month} ${date.year}`}
                      key={date.label}>
                      {date.label}
                    </option>
                  ))}
                </select>

                <i className="fal fa-angle-down" />
              </span>

              <button onClick={() => this.changeDate("add")} className="naked-button">
                <i className="fal fa-angle-right" />
              </button>
            </div>

            <div className="body">
              {dayNames.map(day => (
                <span className="body-header" key={day}>
                  {day}
                </span>
              ))}

              {prevDays.map((time, key) => (
                <span
                  onClick={async () => this.setDate(time)}
                  className={`gray-day ${minDate ? "disabled" : ""}`}
                  key={key}>
                  {time.day}
                </span>
              ))}
              {days.map((time, key) => (
                <span
                  onClick={() => this.setDate(time)}
                  className={`day ${this.state.day === time.day ? "active" : ""} ${
                    (minDate &&
                      moment(`${time.year}-${time.month}-${time.day}`).isBefore(minDate)) ||
                    (maxDate && moment(`${time.year}-${time.month}-${time.day}`).isAfter(maxDate))
                      ? "disabled"
                      : ""
                  }`}
                  key={key}>
                  {time.day}
                </span>
              ))}

              {comingDays.map((time, key) => (
                <span
                  onClick={() => this.setDate(time)}
                  className={`gray-day ${this.props.maxDate ? "disabled" : ""}`}
                  key={key}>
                  {time.day}
                </span>
              ))}

              <UniversalButton
                onClick={() => this.setState({ show: false })}
                type="low"
                label="Cancel"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default DatePicker;
