import * as React from "react";
import {Component} from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

const CreateCompany = gql`
  mutation createCompany($name: String!) {
    createCompany(name: $name) {
      ok
      token
      refreshToken
    }
  }
`;

const updateStatisticData = gql`
  mutation updateStatisticData($data: StatisticData!) {
    updateStatisticData(data: $data) {
      ok
    }
  }
`;

const updateUser = gql`
  mutation updateUser($user: UserInput!) {
    updateUser(user: $user) {
      ok
    }
  }
`;


class Advisor extends Component {

    state = {
        advisorStage: 1,
        companystatistic: {}
    }

goToMarketplace() {
    this.setStatisticData(this.state.companystatistic)
    if (this.adminName) {
        if (this.adminName.value != "") {
            console.log("SPLIT", this.adminName.value)
            let nameArray = []
            nameArray = this.adminName.value.split(" ")
            console.log("SPLITTED", nameArray)
            if (nameArray.length === 1) {
                this.setUserData({lastname: nameArray[0]})
            } else if (nameArray.length === 2) {
                this.setUserData({firstname: nameArray[0], lastname: nameArray[1]})
            } else {
                console.log("NAME", nameArray)
                let middleArray = nameArray.slice(0);
                middleArray.pop()
                middleArray.shift()
                console.log("MIDDLE", middleArray)
                this.setUserData({firstname: nameArray[0], middlename: middleArray.join(" "), lastname: nameArray[(nameArray.length - 1)]})
            }
        }
    }
    this.props.history.push("/area/marketplace")
}

addCompanyName = async (name) => {
    try {
    console.log("ADDCOMP1", this, name)
      const res = await this.props.cc({variables: { name }})
        console.log("RES", res)
        const { ok, token, refreshToken } = res.data.createCompany;
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        return
      }
      catch(err) {
        console.log("ADDCOMP2", this)
        console.log("addCompanyName", err)
        return
      }
  }

setStatisticData = async (data) => {
    try {
    console.log("STATISTIC", this, data)
      const res = await this.props.uSD({variables: { data }})
        console.log("RES", res)
        const { ok } = res.data.updateStatisticData;
        return
      }
      catch(err) {
        console.log("ADDCOMP2", this)
        console.log("addCompanyName", err)
        return
      }
  }

  setUserData = async (user) => {
    try {
    console.log("USERUPDATE", this, user)
      const res = await this.props.uU({variables: { user }})
        console.log("RES UP", res, this)
        const { ok } = res.data.updateUser;
        this.props.setName(user.firstname, user.lastname)
        return
      }
      catch(err) {
        console.log("userUpdateError", err)
        return
      }
  }

nextStep() {
    if (this.state.advisorStage === 7) {
        this.setStatisticData(this.state.companystatistic)
        if (this.adminName.value != "") {
            console.log("SPLIT", this.adminName.value)
            let nameArray = []
            nameArray = this.adminName.value.split(" ")
            console.log("SPLITTED", nameArray)
            if (nameArray.length === 1) {
                this.setUserData({lastname: nameArray[0]})
            } else if (nameArray.length === 2) {
                this.setUserData({firstname: nameArray[0], lastname: nameArray[1]})
            } else {
                console.log("NAME", nameArray)
                let middleArray = nameArray.slice(0);
                middleArray.pop()
                middleArray.shift()
                console.log("MIDDLE", middleArray)
                this.setUserData({firstname: nameArray[0], middlename: middleArray.join(" "), lastname: nameArray[(nameArray.length - 1)]})
            }
        }
        //Namen auslesen und senden
        this.props.history.push("/area/dashboard")
    } else if (this.state.advisorStage === 1) {
        console.log("ADDCOMP", this, this.companyNameInput)
        if (this.companyNameInput != "") {
            this.addCompanyName(this.companyNameInput.value)
        }
        this.setState({advisorStage: (this.state.advisorStage+1)})
    } else {
        this.setState({advisorStage: (this.state.advisorStage+1)})
    }
}

chooseNumberEmployees(option) {
    console.log("EMPLOY", option)
    this.setState({companystatistic: {...this.state.companystatistic, companysize: option}})
    this.setState({advisorStage: (this.state.advisorStage+1)})
}

chooseIndustry(option) {
    this.setState({companystatistic: {...this.state.companystatistic, industry: option}})
    this.setState({advisorStage: (this.state.advisorStage+1)})
}

chooseRevenue(option) {
    this.setState({companystatistic: {...this.state.companystatistic, revenue: option}})
    this.setState({advisorStage: (this.state.advisorStage+1)})
}

chooseCompanyAge(option) {
    this.setState({companystatistic: {...this.state.companystatistic, companyage: option}})
    this.setState({advisorStage: (this.state.advisorStage+1)})
}

chooseAge(option) {
    this.setState({companystatistic: {...this.state.companystatistic, ageofowner: option}})
    this.setState({advisorStage: (this.state.advisorStage+1)})
}

showStep(step) {
    switch (step) {
        case 1:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">First of all: How should your company be called?</label>
                <input className="advisorInputInput" placeholder="Your company name" ref={(input) => { this.companyNameInput = input; }}/>
                <div className="advisorNext button" onClick={() => this.nextStep()}>Next</div>
            </div>
        )
        case 2:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">How many employess do you have?</label>
                <div className="advisorOptionHolder">
                    <div className="advisorOption" onClick={() => this.chooseNumberEmployees("0-5")}>0-5</div>
                    <div className="advisorOption" onClick={() => this.chooseNumberEmployees("6-10")}>6-10</div>
                    <div className="advisorOption" onClick={() => this.chooseNumberEmployees("11-20")}>11-20</div>
                    <div className="advisorOption" onClick={() => this.chooseNumberEmployees("21 or more")}>21 or more</div>
                </div>
                <div className="advisorSkip button" onClick={() => this.nextStep()}>Or Skip</div>
            </div>
        )
        case 3:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">In what industry is your company working</label>
                <div className="advisorOptionHolder">
                    <div className="advisorOption" onClick={() => this.chooseIndustry("Service")}>Service</div>
                    <div className="advisorOption" onClick={() => this.chooseIndustry("Online")}>Online</div>
                    <div className="advisorOption" onClick={() => this.chooseIndustry("Production")}>Production</div>
                    <div className="advisorOption" onClick={() => this.chooseIndustry("Other")}>Other</div>
                </div>
                <div className="advisorSkip button" onClick={() => this.nextStep()}>Or Skip</div>
            </div>
        )
        case 4:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">How old is your company?</label>
                <div className="advisorOptionHolder">
                    <div className="advisorOption" onClick={() => this.chooseCompanyAge("< 3")}>{"< 3"}</div>
                    <div className="advisorOption" onClick={() => this.chooseCompanyAge("3 - 5")}>{"3 - 5"}</div>
                    <div className="advisorOption" onClick={() => this.chooseCompanyAge("6 - 10")}>{"6 - 10"}</div>
                    <div className="advisorOption" onClick={() => this.chooseCompanyAge("> 10")}>{"> 10"}</div>
                </div>
                <div className="advisorSkip button" onClick={() => this.nextStep()}>Or Skip</div>
            </div>
        )
        case 5:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">How much revenue did you generate last year</label>
                <div className="advisorOptionHolder">
                    <div className="advisorOption" onClick={() => this.chooseRevenue("< 100,000$")}>{"< 100,000$"}</div>
                    <div className="advisorOption" onClick={() => this.chooseRevenue("100,000$ - 500,000$")}>{"100,000$ - 500,000$"}</div>
                    <div className="advisorOption" onClick={() => this.chooseRevenue("500,001$ - 1,000,000$")}>{"500,001$ - 1,000,000$"}</div>
                    <div className="advisorOption" onClick={() => this.chooseRevenue("> 1,000,000$")}>{"> 1,000,000$"}</div>
                </div>
                <div className="advisorSkip button" onClick={() => this.nextStep()}>Or Skip</div>
            </div>
        )
        case 6:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">To set up a suitleable user-interface: How old are you?</label>
                <div className="advisorOptionHolder">
                    <div className="advisorOption" onClick={() => this.chooseAge("< 20")}>{"< 20"}</div>
                    <div className="advisorOption" onClick={() => this.chooseAge("20 - 35")}>{"20 - 35"}</div>
                    <div className="advisorOption" onClick={() => this.chooseAge("36 - 50")}>{"36 - 50"}</div>
                    <div className="advisorOption" onClick={() => this.chooseAge("> 50")}>{"> 50"}</div>
                </div>
                <div className="advisorSkip button" onClick={() => this.nextStep()}>Or Skip</div>
            </div>
        )
        case 7:
        return(
            <div className="advisorInputHolder">
                <label className="advisorInputHeading">To personalize your experience: What's your name</label>
                <input className="advisorInputInput" placeholder="Your name" ref={(input) => { this.adminName = input; }}/>
                <div className="advisorNext button" onClick={() => this.nextStep()}>Finish Setup</div>
            </div>
        )
    }
}

showLeave(step) {
    if (step > 1) {
        return (
            <div className="goToMarketplace button" onClick={() => this.goToMarketplace()}>Skip Advisor and look around in the marketplace</div>
        )
    } else {
        return ""
    }
}

  render() {

    return (
        <div className="centralize backgroundLogo">
            <div className="advisorHolder">
                {this.showStep(this.state.advisorStage)}
                {this.showLeave(this.state.advisorStage)}
            </div>
        </div>
    );
  }
}

export default compose(
    graphql(CreateCompany, {
      name: "cc"
    }),
graphql(updateStatisticData, {
    name: "uSD"}),
graphql(updateUser, {
    name: "uU"}))(Advisor);