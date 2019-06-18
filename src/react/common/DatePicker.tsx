import * as React from "react";
import moment = require("moment");
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  minDate?: string;
  handleChange: Function;
  error: string;
  value: string;
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

  componentDidMount() {
    if (this.props.value) {
      this.setState({
        touched: true,
        day: moment(this.props.value).date(),
        month: moment(this.props.value).month() + 1,
        year: moment(this.props.value).year()
      });
    }
  }

  setDate = ({ day, month, year }) => {
    const value = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;

    if (this.props.minDate && moment(value).isBefore(moment(this.props.minDate))) {
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

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dates = [];

    let startYear = firstYear;

    if (this.props.minDate) {
      startYear = moment(this.props.minDate).year();
    }

    if (this.state.show) {
      // prettier-ignore
      for (let i = startYear; i < moment().add(30, "y").year(); i++) {
      for (let j = 1; j <= 12; j++) {
        if(j < moment(this.props.minDate).month() + 1) {
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

    return (
      <div>
        <div className="date-picker" onClick={() => this.setState({ show: true })}>
          <i className="fal fa-calendar" />
          <span className="date-picker-text">
            {touched && this.props.value ? moment(this.props.value).format("DD MMM YYYY") : "Date"}
            {this.props.error && (
              <i title={this.props.error} className="error fal fa-exclamation-circle" />
            )}
          </span>
          <i className="fal fa-angle-down" />
        </div>

        {this.state.show && (
          <div className="date-picker-popup">
            <div className="arrow-up" />

            <div className="header">
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
                <span onClick={async () => this.setDate(time)} className="gray-day" key={key}>
                  {time.day}
                </span>
              ))}

              {days.map((time, key) => (
                <span
                  onClick={() => this.setDate(time)}
                  className={`day ${this.state.day === time.day ? "active" : ""}`}
                  key={key}>
                  {time.day}
                </span>
              ))}

              {comingDays.map((time, key) => (
                <span onClick={() => this.setDate(time)} className="gray-day" key={key}>
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
