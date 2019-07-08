import * as React from "react";

interface Props {
  showPopup: Function;
}

interface State {
  show: Boolean;
}

class LShower extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = () => {
    this.setState(prevState => {
      return { show: !prevState.show };
    });
  };

  render() {
    console.log("LSHOWER", this.props);
    return (
      <div className="genericPage employeeManager">
        <div className="genericPageName">
          <span>Services > Wunderlist Test Team</span>
          <i className="fal fa-search searchButtonHeading" />
        </div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Generel Information</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gridColumnGap: "10px",
                  gridTemplateRows: "repeat(9, 20px)",
                  alignItems: "center"
                }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    gridTemplateRows: "repeat(9, 20px)",
                    gridColumnGap: "10px",
                    gridRow: "1/17",
                    alignItems: "center"
                  }}>
                  <div
                    className="box80"
                    style={{
                      gridRow: "1/5",
                      position: "relative",
                      backgroundImage:
                        "url('https://storage.googleapis.com/vipfy-imagestore-01/icons/05012019-t3es1-wunderlist-png')"
                    }}
                  />
                  <div style={{ gridColumn: 1, gridRow: 5, textAlign: "center" }}>Wunderlist</div>

                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 7
                    }}>
                    20 Licences
                  </div>
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 8
                    }}>
                    3 unused
                  </div>
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 9,
                      backgroundColor: "yellow",
                      textAlign: "center"
                    }}>
                    rational 50
                  </div>
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: "1/3",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center"
                    }}>
                    Wunderlist Test Team
                  </div>
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: "3/5",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center"
                    }}>
                    Silver Plan
                  </div>

                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: "5/7"
                    }}>
                    Active since:
                    <br />
                    11.22.10
                  </div>
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: "7/9"
                    }}>
                    Ends at:
                    <br />
                    24.11.12
                  </div>
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: 9
                    }}>
                    turns into Gold
                  </div>
                </div>
                <div style={{ gridColumn: 2, gridRow: 1, fontWeight: "bold" }}>Costs</div>
                <div style={{ gridColumn: 2, gridRow: 2 }}>100€/month</div>
                <div style={{ gridColumn: 2, gridRow: 3 }}>avg. per user 10€</div>
                <div style={{ gridColumn: 2, gridRow: 5, fontWeight: "bold" }}>Average Usage:</div>
                <div style={{ gridColumn: 2, gridRow: 6 }}>this week: 20</div>
                <div style={{ gridColumn: 2, gridRow: 7 }}>this month: 20</div>
                <div style={{ gridColumn: 2, gridRow: 8 }}>this quarter: 20</div>
                <div style={{ gridColumn: 2, gridRow: 9 }}>this year: 20</div>
                {/*<div style={{ gridColumn: 2, gridRow: 1, backgroundColor: "red" }}>Chat</div>
                <div style={{ gridColumn: 2, gridRow: 3, fontWeight: "bold" }}>Email</div>
                <div style={{ gridColumn: 2, gridRow: 4 }}>nv@vipfy.store</div>
                <div style={{ gridColumn: 2, gridRow: 5 }}>nv@vipfy.com</div>
                <div style={{ gridColumn: 2, gridRow: 6 }}>and three more</div>
                <div style={{ gridColumn: 2, gridRow: 8, fontWeight: "bold" }}>Phone</div>
                <div style={{ gridColumn: 2, gridRow: 9 }}>2348923498</div>
                <div style={{ gridColumn: 2, gridRow: 10 }}>28082345</div>
                <div style={{ gridColumn: 2, gridRow: 13, fontWeight: "bold" }}>Address</div>
                <div style={{ gridColumn: 2, gridRow: 14 }}>sdjdfskjh</div>
                <div style={{ gridColumn: 2, gridRow: 15 }}>asfasfasf</div>
                <div style={{ gridColumn: 2, gridRow: 16 }}>and one more</div>*/}

                <div style={{ gridColumn: 3, gridRow: 1, fontWeight: "bold" }}>
                  Most active users
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    gridColumn: 3,
                    gridRow: "2/5",
                    gridTemplateRows: "20px 20px 20px",
                    alignItems: "center"
                  }}>
                  <div style={{ gridColumn: 1, gridRow: 1 }}>10 hours</div>
                  <div style={{ gridColumn: 1, gridRow: 2 }}>10 hours</div>
                  <div style={{ gridColumn: 1, gridRow: 3 }}>9 hours</div>

                  {/*<div style={{ gridColumn: 2, gridRow: 1 }}>Basfas Basfasg</div>
                  <div style={{ gridColumn: 2, gridRow: 2 }}>Jsasf Fasgasg</div>*/}
                  <div style={{ gridColumn: 2, gridRow: 3 }}>Bilbo Brödlin</div>

                  <div
                    className="circle20"
                    style={{
                      gridColumn: 2,
                      gridRow: 1,
                      backgroundImage:
                        "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/28122018-ri1eb-markus-mueller-jpeg')"
                    }}
                  />
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: 1,
                      marginLeft: "25px"
                    }}>
                    Markus Müller
                  </div>
                  <div
                    className="circle20"
                    style={{
                      gridColumn: 2,
                      gridRow: 2,
                      float: "left",
                      backgroundImage:
                        "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg')"
                    }}
                  />
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: 2,
                      marginLeft: "25px"
                    }}>
                    Nils Vossebein
                  </div>
                </div>
                <div style={{ gridColumn: 3, gridRow: 6, fontWeight: "bold" }}>
                  Least active users
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px",
                    gridColumn: 3,
                    gridRow: "7/10",
                    gridTemplateRows: "20px 20px 20px",
                    alignItems: "center"
                  }}>
                  {/*<div style={{ gridColumn: 1, gridRow: 1 }}>Hasgdsg Jgsdhdfh</div>
                  <div style={{ gridColumn: 1, gridRow: 2 }}>Aasgfsg Hsdhfhsdfh</div>*/}
                  <div style={{ gridColumn: 1, gridRow: 3 }}>Mtzighk Kasgsfdhölkf</div>

                  <div
                    className="circle20"
                    style={{
                      gridColumn: 1,
                      gridRow: 1,
                      backgroundImage:
                        "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/28122018-ri1eb-markus-mueller-jpeg')"
                    }}
                  />
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 1,
                      marginLeft: "25px"
                    }}>
                    Markus Müller
                  </div>

                  <div
                    className="circle20"
                    style={{
                      gridColumn: 1,
                      gridRow: 2,
                      backgroundImage:
                        "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg')"
                    }}
                  />
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 2,
                      marginLeft: "25px"
                    }}>
                    Nils Vossebein
                  </div>

                  <div style={{ gridColumn: 2, gridRow: 1 }}>50 sec</div>
                  <div style={{ gridColumn: 2, gridRow: 2 }}>1 min</div>
                  <div style={{ gridColumn: 2, gridRow: 3 }}>5 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Assigned Users</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <div className="appExplain">
                <div />
                <div>Username:</div>
                <div>Average usage</div>
              </div>
              <div className="appExplain">
                <div
                  className="circle50"
                  style={{
                    marginRight: "5px",
                    backgroundImage:
                      "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/07012019-xm5db-9b-jpg')"
                  }}
                />
                <div>Nils Vossebein</div>
                <div>20 hours/week</div>
              </div>
              <div className="appExplain">
                <div
                  className="circle50"
                  style={{
                    backgroundImage:
                      "url('https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/28122018-ri1eb-markus-mueller-jpeg')"
                  }}
                />
                <div>Markus Müller</div>
                <div>20 hours/week</div>
              </div>
            </div>
          </div>
        </div>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
              //onClick={this.toggle}
            />
            <span>Assigned Departments</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <div className="appExplain">
                <div />
                <div>Departmentname:</div>
                <div>Number of members</div>
              </div>
              <div className="appExplain">
                <div
                  className="hex"
                  style={{ backgroundColor: "#20baa9", borderColor: "#20baa9" }}
                  ref={e => (this.element = e)}>
                  <span>M</span>
                  {console.log("TESTING", this)
                  /*<div
                className="titleBox"
                style={{
                  top: this.element ? this.calculateTop(this.element, -10) : "",
                  left: this.element ? this.calculateLeft(this.element, 0, 2) : ""
                }}>
                Marketing
            </div>*/
                  }
                </div>
                <div>Marketing</div>
                <div>20 more members</div>
              </div>
              <div className="appExplain">
                <div className="hex" style={{ backgroundColor: "#c73544", borderColor: "#c73544" }}>
                  P
                </div>
                <div>Production</div>
                <div>10 more members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LShower;
