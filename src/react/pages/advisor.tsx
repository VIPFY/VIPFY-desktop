import * as React from "react";
import { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { forEach } from "async";
import { STATUS_CODES } from "http";
import { ProvidedNonNullArguments } from "graphql/validation/rules/ProvidedNonNullArguments";
import { AppContext } from "../common/functions";
import GenericInputFields from "../components/GenericInputFields";

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
    companystatistic: {},
    industry: "",
    subindustry: ""
  };

  goToMarketplace() {
    this.setStatisticData(this.state.companystatistic);
    if (this.adminName) {
      if (this.adminName.value != "") {
        console.log("SPLIT", this.adminName.value);
        let nameArray = [];
        nameArray = this.adminName.value.split(" ");
        console.log("SPLITTED", nameArray);
        if (nameArray.length === 1) {
          this.setUserData({ lastname: nameArray[0] });
        } else if (nameArray.length === 2) {
          this.setUserData({ firstname: nameArray[0], lastname: nameArray[1] });
        } else {
          console.log("NAME", nameArray);
          let middleArray = nameArray.slice(0);
          middleArray.pop();
          middleArray.shift();
          console.log("MIDDLE", middleArray);
          this.setUserData({
            firstname: nameArray[0],
            middlename: middleArray.join(" "),
            lastname: nameArray[nameArray.length - 1]
          });
        }
      }
    }
    this.props.history.push("/area/marketplace");
  }

  addCompanyName = async name => {
    try {
      console.log("ADDCOMP1", this, name);
      const res = await this.props.cc({ variables: { name } });
      console.log("RES", res);
      const { ok, token, refreshToken } = res.data.createCompany;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      return;
    } catch (err) {
      console.log("ADDCOMP2", this);
      console.log("addCompanyName", err);
      return;
    }
  };

  setStatisticData = async data => {
    try {
      console.log("STATISTIC", this, data);
      const res = await this.props.uSD({ variables: { data } });
      console.log("RES", res);
      const { ok } = res.data.updateStatisticData;
      return;
    } catch (err) {
      console.log("ADDCOMP2", this);
      console.log("addCompanyName", err);
      return;
    }
  };

  setUserData = async user => {
    try {
      console.log("USERUPDATE", this, user);
      const res = await this.props.uU({ variables: { user } });
      console.log("RES UP", res, this);
      const { ok } = res.data.updateUser;
      this.props.setName(user.firstname, user.lastname);
      return;
    } catch (err) {
      console.log("userUpdateError", err);
      return;
    }
  };

  nextStep() {
    if (this.state.advisorStage === 7) {
      this.setStatisticData(this.state.companystatistic);
      if (this.adminName.value != "") {
        console.log("SPLIT", this.adminName.value);
        let nameArray = [];
        nameArray = this.adminName.value.split(" ");
        console.log("SPLITTED", nameArray);
        if (nameArray.length === 1) {
          this.setUserData({ lastname: nameArray[0] });
        } else if (nameArray.length === 2) {
          this.setUserData({ firstname: nameArray[0], lastname: nameArray[1] });
        } else {
          console.log("NAME", nameArray);
          let middleArray = nameArray.slice(0);
          middleArray.pop();
          middleArray.shift();
          console.log("MIDDLE", middleArray);
          this.setUserData({
            firstname: nameArray[0],
            middlename: middleArray.join(" "),
            lastname: nameArray[nameArray.length - 1]
          });
        }
      }
      //Namen auslesen und senden
      this.props.history.push("/area/dashboard");
    } else if (this.state.advisorStage === 1) {
      console.log("ADDCOMP", this, this.companyNameInput);
      if (this.companyNameInput != "") {
        this.addCompanyName(this.companyNameInput.value);
      }
      this.setState({ advisorStage: this.state.advisorStage + 1 });
    } else {
      this.setState({ advisorStage: this.state.advisorStage + 1 });
    }
  }

  chooseNumberEmployees(option) {
    console.log("EMPLOY", option);
    this.setState({
      companystatistic: { ...this.state.companystatistic, companysize: option }
    });
    this.setState({ advisorStage: this.state.advisorStage + 1 });
  }

  chooseIndustry(option) {
    this.setState({
      companystatistic: { ...this.state.companystatistic, industry: option }
    });
    this.setState({ advisorStage: this.state.advisorStage + 1 });
  }

  chooseRevenue(option) {
    this.setState({
      companystatistic: { ...this.state.companystatistic, revenue: option }
    });
    this.setState({ advisorStage: this.state.advisorStage + 1 });
  }

  chooseCompanyAge(option) {
    this.setState({
      companystatistic: { ...this.state.companystatistic, companyage: option }
    });
    this.setState({ advisorStage: this.state.advisorStage + 1 });
  }

  chooseAge(option) {
    this.setState({
      companystatistic: { ...this.state.companystatistic, ageofowner: option }
    });
    this.setState({ advisorStage: this.state.advisorStage + 1 });
  }

  handleEnter(e) {
    if (e.key === "Enter") {
      this.nextStep();
    }
  }

  showStep(step) {
    switch (step) {
      case 1:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">
              First of all: How should your company be called?
            </label>
            <input
              className="advisorInputInput"
              placeholder="Your company name"
              ref={input => {
                this.companyNameInput = input;
              }}
              onKeyPress={e => this.handleEnter(e)}
            />
            <div className="advisorNext button" onClick={() => this.nextStep()}>
              Next
            </div>
          </div>
        );
      case 2:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">How many employess do you have?</label>
            <div className="advisorOptionHolder">
              <div className="advisorOption" onClick={() => this.chooseNumberEmployees("1-10")}>
                1-10
              </div>
              <div className="advisorOption" onClick={() => this.chooseNumberEmployees("11-50")}>
                11-50
              </div>
              <div className="advisorOption" onClick={() => this.chooseNumberEmployees("51-200")}>
                51-200
              </div>
              <div
                className="advisorOption"
                onClick={() => this.chooseNumberEmployees("201 or more")}>
                201 or more
              </div>
            </div>
            <div className="advisorSkip button" onClick={() => this.nextStep()}>
              Or Skip
            </div>
          </div>
        );
      case 3:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">In what industry is your company working</label>
            <div className="advisorOptionHolder">
              <div className="advisorOption" onClick={() => this.chooseIndustry("Service")}>
                Service
              </div>
              <div className="advisorOption" onClick={() => this.chooseIndustry("Online")}>
                Online
              </div>
              <div className="advisorOption" onClick={() => this.chooseIndustry("Production")}>
                Production
              </div>
              <div className="advisorOption" onClick={() => this.chooseIndustry("Other")}>
                Other
              </div>
            </div>
            <div className="advisorSkip button" onClick={() => this.nextStep()}>
              Or Skip
            </div>
          </div>
        );
      case 4:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">How old is your company?</label>
            <div className="advisorOptionHolder">
              <div className="advisorOption" onClick={() => this.chooseCompanyAge("< 3")}>
                {"< 3"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseCompanyAge("3 - 5")}>
                {"3 - 5"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseCompanyAge("6 - 10")}>
                {"6 - 10"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseCompanyAge("> 10")}>
                {"> 10"}
              </div>
            </div>
            <div className="advisorSkip button" onClick={() => this.nextStep()}>
              Or Skip
            </div>
          </div>
        );
      case 5:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">
              How much revenue did you generate last year
            </label>
            <div className="advisorOptionHolder">
              <div className="advisorOption" onClick={() => this.chooseRevenue("< 100,000$")}>
                {"< 100,000$"}
              </div>
              <div
                className="advisorOption"
                onClick={() => this.chooseRevenue("100,000$ - 500,000$")}>
                {"100,000$ - 500,000$"}
              </div>
              <div
                className="advisorOption"
                onClick={() => this.chooseRevenue("500,001$ - 1,000,000$")}>
                {"500,001$ - 1,000,000$"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseRevenue("> 1,000,000$")}>
                {"> 1,000,000$"}
              </div>
            </div>
            <div className="advisorSkip button" onClick={() => this.nextStep()}>
              Or Skip
            </div>
          </div>
        );
      case 6:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">
              To set up a suitable user-interface: How old are you?
            </label>
            <div className="advisorOptionHolder">
              <div className="advisorOption" onClick={() => this.chooseAge("< 20")}>
                {"< 20"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseAge("20 - 35")}>
                {"20 - 35"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseAge("36 - 50")}>
                {"36 - 50"}
              </div>
              <div className="advisorOption" onClick={() => this.chooseAge("> 50")}>
                {"> 50"}
              </div>
            </div>
            <div className="advisorSkip button" onClick={() => this.nextStep()}>
              Or Skip
            </div>
          </div>
        );
      case 7:
        return (
          <div className="advisorInputHolder">
            <label className="advisorInputHeading">
              To personalize your experience: What's your name
            </label>
            <input
              className="advisorInputInput"
              placeholder="Your name"
              ref={input => {
                this.adminName = input;
              }}
            />
            <div className="advisorNext button" onClick={() => this.nextStep()}>
              Finish Setup
            </div>
          </div>
        );
    }
  }

  showLeave(step) {
    if (step > 1) {
      return (
        <div className="goToMarketplace button" onClick={() => this.goToMarketplace()}>
          Skip Advisor and look around in the marketplace
        </div>
      );
    } else {
      return "";
    }
  }

  setIndustry(e) {
    this.setState({ industry: e });
    console.log("SETI", this.state);
  }
  setSubIndustry(e) {
    this.setState({ subindustry: e });
    console.log("SETI", this.state);
  }

  showSubIndustry(industryid: String) {
    const subIndustries = {
      "11": [
        { value: "111", title: "Crop Production" },
        { value: "112", title: "Animal Production and Aquaculture" },
        { value: "113", title: "Forestry and Logging" },
        { value: "114", title: "Fishing, Hunting and Trapping" },
        { value: "115", title: "Support Activities for Agriculture and Forestry" }
      ],
      "21": [
        { value: "211", title: "Oil and Gas Extraction" },
        { value: "212", title: "Mining (except Oil and Gas)" },
        { value: "213", title: "Support Activities for Mining" }
      ],
      "23": [
        { value: "236", title: "Construction of Buildings" },
        { value: "237", title: "Heavy and Civil Engineering Construction" },
        { value: "238", title: "Specialty Trade Contractors" }
      ],
      "31-33": [
        { value: "311", title: "Food Manufacturing" },
        { value: "312", title: "Beverage and Tobacco Product Manufacturing" },
        { value: "313", title: "Textile Mills" },
        { value: "314", title: "Textile Product Mills" },
        { value: "315", title: "Apparel Manufacturing" },
        { value: "316", title: "Leather and Allied Product Manufacturing" },
        { value: "321", title: "Wood Product Manufacturing" },
        { value: "322", title: "Paper Manufacturing" },
        { value: "323", title: "Printing and Related Support Activities" },
        { value: "324", title: "Petroleum and Coal Products Manufacturing" },
        { value: "325", title: "Chemical Manufacturing" },
        { value: "326", title: "Plastics and Rubber Products Manufacturing" },
        { value: "327", title: "Nonmetallic Mineral Product Manufacturing" },
        { value: "331", title: "Primary Metal Manufacturing" },
        { value: "332", title: "Fabricated Metal Product Manufacturing" },
        { value: "333", title: "Machinery Manufacturing" },
        { value: "334", title: "Computer and Electronic Product Manufacturing" },
        { value: "335", title: "Electrical Equipment, Appliance, and Component Manufacturing" },
        { value: "336", title: "Transportation Equipment Manufacturing" },
        { value: "337", title: "Furniture and Related Product Manufacturing" },
        { value: "339", title: "Miscellaneous Manufacturing" }
      ],
      "42": [
        { value: "423", title: "Merchant Wholesalers, Durable Goods" },
        { value: "424", title: "Merchant Wholesalers, Nondurable Goods" },
        { value: "425", title: "Wholesale Electronic Markets and Agents and Brokers" }
      ],
      "44-45": [
        { value: "441", title: "Motor Vehicle and Parts Dealers" },
        { value: "442", title: "Furniture and Home Furnishings Stores" },
        { value: "443", title: "Electronics and Appliance Stores" },
        { value: "444", title: "Building Material and Garden Equipment and Supplies Dealers" },
        { value: "445", title: "Food and Beverage Stores" },
        { value: "446", title: "Health and Personal Care Stores" },
        { value: "447", title: "Gasoline Stations" },
        { value: "448", title: "Clothing and Clothing Accessories Stores" },
        { value: "451", title: "Sporting Goods, Hobby, Musical Instrument, and Book Stores" },
        { value: "452", title: "General Merchandise Stores" },
        { value: "453", title: "Miscellaneous Store Retailers" },
        { value: "454", title: "Nonstore Retailers" }
      ],
      "48-49": [
        { value: "481", title: "Air Transportation" },
        { value: "482", title: "Rail Transportation" },
        { value: "483", title: "Water Transportation" },
        { value: "484", title: "Truck Transportation" },
        { value: "485", title: "Transit and Ground Passenger Transportation" },
        { value: "486", title: "Pipeline Transportation" },
        { value: "487", title: "Scenic and Sightseeing Transportation" },
        { value: "488", title: "Support Activities for Transportation" },
        { value: "491", title: "Postal Service" },
        { value: "492", title: "Couriers and Messengers" },
        { value: "493", title: "Warehousing and Storage" }
      ],
      "51": [
        { value: "511", title: "Publishing Industries (except Internet)" },
        { value: "512", title: "Motion Picture and Sound Recording Industries" },
        { value: "515", title: "Broadcasting (except Internet)" },
        { value: "517", title: "Telecommunications" },
        { value: "518", title: "Data Processing, Hosting, and Related Services" },
        { value: "519", title: "Other Information Services" }
      ],
      "52": [
        { value: "521", title: "Monetary Authorities-Central Bank" },
        { value: "522", title: "Credit Intermediation and Related Activities" },
        {
          value: "523",
          title:
            "Securities, Commodity Contracts, and Other Financial Investments and Related Activities"
        },
        { value: "524", title: "Insurance Carriers and Related Activities" },
        { value: "525", title: "Funds, Trusts, and Other Financial Vehicles" }
      ],
      "53": [
        { value: "531", title: "Real Estate" },
        { value: "532", title: "Rental and Leasing Services" },
        {
          value: "533",
          title: "Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)"
        }
      ],
      "56": [
        { value: "561", title: "Administrative and Support Services" },
        { value: "562", title: "Waste Management and Remediation Services" }
      ],
      "62": [
        { value: "621", title: "Ambulatory Health Care Services" },
        { value: "622", title: "Hospitals" },
        { value: "623", title: "Nursing and Residential Care Facilities" },
        { value: "624", title: "Social Assistance" }
      ],
      "71": [
        { value: "711", title: "Performing Arts, Spectator Sports, and Related Industries" },
        { value: "712", title: "Museums, Historical Sites, and Similar Institutions" },
        { value: "713", title: "Amusement, Gambling, and Recreation Industries" }
      ],
      "72": [
        { value: "721", title: "Accommodation" },
        { value: "722", title: "Food Services and Drinking Places" }
      ],
      "81": [
        { value: "811", title: "Repair and Maintenance " },
        { value: "812", title: "Personal and Laundry Services" },
        {
          value: "813",
          title: "Religious, Grantmaking, Civic, Professional, and SimilarOrganizations"
        },
        { value: "814", title: "Private Households" }
      ],
      "92": [
        { value: "921", title: "Executive, Legislative, and Other General Government Support" },
        { value: "922", title: "Justice, Public Order, and Safety Activities" },
        { value: "923", title: "Administration of Human Resource Programs" },
        { value: "924", title: "Administration of Environmental Quality Programs" },
        {
          value: "925",
          title: "Administration of Housing Programs, Urban Planning, and Community Development"
        },
        { value: "926", title: "Administration of Economic Programs" },
        { value: "927", title: "Space Research and Technology" },
        { value: "928", title: "National Security and International Affairs" }
      ]
    };
    if (subIndustries[industryid]) {
      let subIndustryArray: JSX.Element[] = [];
      subIndustries[industryid].forEach((element, index) => {
        subIndustryArray.push(
          <option key={`suboption-${index}`} value={element.value}>
            {element.title}
          </option>
        );
      });

      return (
        <div className="inputBox">
          <span className="inputBoxTitle">Subindustry</span>
          <select
            placeholder="Select Subindustry"
            onChange={e => this.setSubIndustry(e.target.value)}
            defaultValue="">
            <option value="" disabled hidden>
              Please choose an Industry
            </option>
            {subIndustryArray}
          </select>
        </div>
      );
    }
  }

  showExistingCompany() {
    return (
      <div>
        <div className="inputBox">
          <span className="inputBoxTitle">Address</span>
          <input
            className="inputBoxField"
            placeholder=""
            value="COMPANY NAME"
            disabled
            style={{ backgroundColor: "white" }}
          />
          <input className="inputBoxField" placeholder="Second Line" />
          <input className="inputBoxField" placeholder="Street" />
          <input className="inputBoxField" placeholder="City" />
          <input className="inputBoxField" placeholder="State" />
          <input className="inputBoxField" placeholder="Country" />
        </div>
        <div className="inputBox">
          <span className="inputBoxTitle">Revenue</span>
          <input className="inputBoxField" placeholder="This year" />
          <input className="inputBoxField" placeholder="Last year" />
        </div>
        <div className="inputBox">
          <span className="inputBoxTitle">Number of Employees</span>
          <input className="inputBoxField" placeholder="Number of Employees" />
        </div>
      </div>
    );
  }

  showCompanyFacts(value) {
    return (
      <div className="optionsFormularBlock">
        <div>
          <div className="inputBox">
            <span className="inputBoxTitle">Company Name</span>
            <input className="inputBoxField" placeholder="Example Inc" />
          </div>
          <div className="inputBox">
            <span className="inputBoxTitle">Industry</span>
            <select
              placeholder="Select Industry"
              onChange={e => this.setIndustry(e.target.value)}
              defaultValue="">
              <option value="" disabled hidden>
                Please choose an Industry
              </option>
              <option value="11">Agriculture, Forestry, Fishing and Hunting‎</option>
              <option value="21">Mining, Quarrying, and Oil and Gas Extraction</option>
              <option value="22">Utilities</option>
              <option value="23">Construction</option>
              <option value="31-33">Manufacturing</option>
              <option value="42">Wholesale Trade</option>
              <option value="44-45">Retail Trade</option>
              <option value="48-49">Transportation and Warehousing</option>
              <option value="51">Information</option>
              <option value="52">Finance and Insurance</option>
              <option value="53">Real Estate and Rental and Leasing</option>
              <option value="54">Professional, Scientific, and Technical Services</option>
              <option value="55">Management of Companies and Enterprises</option>
              <option value="56">
                Administrative and Support and Waste Management and Remediation Services
              </option>
              <option value="61">Educational Services</option>
              <option value="62">Health Care and Social Assistance</option>
              <option value="71">Arts, Entertainment, and Recreation</option>
              <option value="72">Accommodation and Food Services</option>
              <option value="81">Other Services (except Public Administration)</option>
              <option value="92">Public Administration</option>
            </select>
          </div>
          {this.showSubIndustry(this.state.industry)}
          <div className="tabBox">
            <div className="tab tabActive">Existing Company</div>
            <div className="tab">Production phase</div>
            <div className="tab">Idea phase</div>
          </div>
          {this.showExistingCompany()}
          <div className="advisorBottomPageButtonsHolder">
            <button
              className="advisorBottomPageButtonNext"
              onClick={() => value.moveTo("/area/advisor/personfacts")}>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  showExplainBlock() {
    return (
      <div className="optionsExplainBlock">
        <div className="optionsExplainTextHolder">
          <i className="far fa-building optionsExplainIconHolder" />
          <span className="optionsExplainHeading">Tell us a bit about your Company</span>
          <p>
            We use this information to set up your VIPFY-Account, find the best fitting services for
            you and provide generel data to the service Providers.
          </p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <AppContext.Consumer>
        {value => {
          console.log("ADVISOR", this.props, value);
          return (
            <div className="optionsHolder">
              <div className="optionsSidebar">
                <div className="journeyHolder">
                  <div className="journeyHeader">Your journey to your own company</div>
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "4rem",
                      left: "0rem"
                    }}>
                    Facts about your company
                  </div>
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "1rem",
                      width: "5.5rem",
                      left: "3.5rem",
                      borderBottom: "dotted white",
                      borderLeft: "dotted white",
                      top: "11rem",
                      borderRadius: "0rem 1rem"
                    }}
                  />
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "9rem",
                      left: "9rem"
                    }}
                    onClick={() => value.moveTo("/area/advisor/personfacts")}>
                    Facts about you
                  </div>
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "4rem",
                      width: "4.5rem",
                      left: "8rem",
                      borderBottom: "dotted white",
                      borderRight: "dotted white",
                      top: "16rem",
                      borderRadius: "4rem 0rem"
                    }}
                  />
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "17rem",
                      left: "1rem"
                    }}>
                    Company Settings
                  </div>
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "4rem",
                      width: "2.5rem",
                      left: "4.5rem",
                      borderBottom: "dotted white",
                      borderLeft: "dotted white",
                      top: "24rem",
                      borderRadius: "0rem 2.5rem"
                    }}
                  />
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "25rem",
                      left: "7rem"
                    }}>
                    Your Account Settings
                  </div>
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "5rem",
                      width: "3.5rem",
                      left: "7rem",
                      borderBottom: "dotted white",
                      borderRight: "dotted white",
                      top: "32rem",
                      borderRadius: "3.5rem 0rem"
                    }}
                  />
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "34rem",
                      left: "0rem"
                    }}>
                    Service Settings
                  </div>
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "4rem",
                      width: "5.5rem",
                      left: "3.5rem",
                      borderBottom: "dotted white",
                      borderLeft: "dotted white",
                      top: "41rem",
                      borderRadius: "0rem 4rem"
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      position: "absolute",
                      height: "33rem",
                      width: "0.5rem",
                      left: "16rem",
                      borderBottom: "dotted white",
                      borderRight: "dotted white",
                      borderTop: "dotted white",
                      top: "12rem",
                      borderRadius: "0rem 40rem 40rem 0rem"
                    }}
                  />
                  <div
                    className="journeyCircle"
                    style={{
                      position: "absolute",
                      top: "42rem",
                      left: "9rem"
                    }}
                    onClick={() => value.moveTo("/area/marketplace")}>
                    Marketplace
                  </div>
                </div>
              </div>
              {this.showCompanyFacts(value)}
              {this.showExplainBlock()}
            </div>
          );
        }}
      </AppContext.Consumer>
    );
  }
}

export default compose(
  graphql(CreateCompany, {
    name: "cc"
  }),
  graphql(updateStatisticData, {
    name: "uSD"
  }),
  graphql(updateUser, {
    name: "uU"
  })
)(Advisor);
