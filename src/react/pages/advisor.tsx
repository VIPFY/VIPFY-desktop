import * as React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { AppContext } from "../common/functions";
import GenericInputField from "../components/GenericInputField";
import AdvisorSidebar from "../components/AdvisorSidebar";
import { updateUser } from "../mutations/auth"

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
  mutation updateStatisticData($data: JSON!) {
    updateStatisticData(data: $data) {
      ok
    }
  }
`;

const createAddress = gql`
mutation createAddress($addressData: AddressInput!, $department: Boolean) {
  createAddress(addressData: $addressData, department: $department) {
    ok
  }
}
`;

interface Props {
  setApp: Function;
  setName: Function;
}

interface State {
  advisorStage: number;
  companystatistic: any;
  industry: string;
  subindustry: string;
  companyname: string;
  focus: number;
  tabActive: number;
  noCompanyName: boolean;
  thisYearRevenue: number;
  lastYearRevenue: number;
  thisYearExpectedRevenue: number;
  nextYearExpectedRevenue: number;
  foundingYearOfCompany: number;
  expectedYearOfMarketEntry: number;
  numberOfEmployees: number;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  addressZip: string;
  addressStreet: string;
  addressSecondLine: string;
  addressFirstLine: string;
  adminname: string;
  adminage: number;
  education: string;
  jobCategory: string;
  workexperience: string;
}

class Advisor extends React.Component<Props, State> {
  state = {
    advisorStage: 1,
    companystatistic: {},
    industry: "",
    subindustry: "",
    companyname: null,
    focus: 0,
    tabActive: 1,
    noCompanyName: false,
    thisYearRevenue: null,
    lastYearRevenue: null,
    thisYearExpectedRevenue: null,
    nextYearExpectedRevenue: null,
    foundingYearOfCompany: null,
    expectedYearOfMarketEntry: null,
    numberOfEmployees: null,
    addressCountry: "US",
    addressState: null,
    addressCity: null,
    addressZip: null,
    addressStreet: null,
    addressSecondLine: null,
    addressFirstLine: null,
    adminname: null,
    adminage: null,
    education: null,
    jobCategory: null,
    workexperience: null
  };

  componentDidMount() {
    if (this.props.match.params) {
    switch (this.props.match.params.typeid) {
    case "personfacts":
      this.setState({advisorStage: 2})
    break;
    default:
    this.setState({advisorStage: 1})
    }
    }
  }

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
      console.info("USERUPDATE", this, user);
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
    console.log("press",e.key)
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
  setEducation(e) {
    this.setState({ education: e });
    console.log("SETI", this.state);
  }

  setJobCategory(e) {
    this.setState({ jobCategory: e });
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

  updateState = (key, value) => {
    console.log("SUBMIT", key value);
    this.setState({key: value})
  };

  onEnter = async (fieldid) => {
    console.log("ONENTER", fieldid)
    await this.setState({focus: fieldid})
  }

  showRevenue(tabActive){
    switch(tabActive){
      case 1:
      return(<div className="inputBox">
      <span className="inputBoxTitle">Revenue</span>
      <GenericInputField
        fieldClass="inputBoxField"
        divClass="inputBoxHolder"
        placeholder="This year"
        onBlur={(value) => this.setState({"thisYearRevenue": value})}
        inputType="currency"
        symbol="$"
        symbolClass="inputBoxSymbol"
        focus={this.state.focus === 8}
        onEnter={()=>this.onEnter(9)}
        onClick={()=>this.onEnter(8)}
        />
        <GenericInputField
        fieldClass="inputBoxField"
        divClass="inputBoxHolder"
        placeholder="Last year"
        onBlur={(value) => this.setState({"lastYearRevenue": value})}
        inputType="currency"
        symbol="$"
        symbolClass="inputBoxSymbol"
        focus={this.state.focus === 9}
        onEnter={()=>this.onEnter(10)}
        onClick={()=>this.onEnter(9)}
        />
    </div>)
      case 2:
      return(
    <div className="inputBox">
          <span className="inputBoxTitle">Expected Revenue</span>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass="inputBoxHolder"
            placeholder="This year"
            onBlur={(value) => this.setState({"thisYearExpectedRevenue": value})}
            inputType="currency"
            symbol="$"
            symbolClass="inputBoxSymbol"
            focus={this.state.focus === 8}
            onEnter={()=>this.onEnter(9)}
            onClick={()=>this.onEnter(8)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass="inputBoxHolder"
            placeholder="Next year"
            onBlur={(value) => this.setState({"nextYearExpectedRevenue": value})}
            inputType="currency"
            symbol="$"
            symbolClass="inputBoxSymbol"
            focus={this.state.focus === 9}
            onEnter={()=>this.onEnter(10)}
            onClick={()=>this.onEnter(9)}
            />
        </div>
       )
        case 3:
        return(<div className="inputBox">
        <span className="inputBoxTitle">Expected Revenue in first year of selling</span>
        <GenericInputField
          fieldClass="inputBoxField"
          divClass="inputBoxHolder"
          placeholder="This year"
          onBlur={(value) => this.setState({"firstYearExpectedRevenue": value})}
          inputType="currency"
          symbol="$"
          symbolClass="inputBoxSymbol"
          focus={this.state.focus === 9}
          onEnter={()=>this.onEnter(10)}
          onClick={()=>this.onEnter(9)}
          />
          </div>)
    }
  }

  showStart(tabActive){
    switch (tabActive){
      case 1: return(
        <div className="inputBox">
            <span className="inputBoxTitle">Founding year of company</span>
              <GenericInputField
              fieldClass="inputBoxField"
              divClass="inputBoxHolder"
              placeholder="2018"
              onBlur={(value) => this.setState({"foundingYearOfCompany": value})}
              inputType="number"
              focus={this.state.focus === 10}
              onEnter={()=>this.onEnter(11)}
              onClick={()=>this.onEnter(10)}
              />
          </div>)
      case 2: return(
        <div className="inputBox">
            <span className="inputBoxTitle">Founding year of company</span>
              <GenericInputField
              fieldClass="inputBoxField"
              divClass="inputBoxHolder"
              placeholder="2018"
              onBlur={(value) => this.setState({"foundingYearOfCompany": value})}
              inputType="number"
              focus={this.state.focus === 10}
              onEnter={()=>this.onEnter(11)}
              onClick={()=>this.onEnter(10)}
              />
          </div>)
      case 3: return(
        <div className="inputBox">
            <span className="inputBoxTitle">Expected year of market entry</span>
              <GenericInputField
              fieldClass="inputBoxField"
              divClass="inputBoxHolder"
              placeholder="2019"
              onBlur={(value) => this.setState({"expectedYearOfMarketEntry": value})}
              inputType="number"
              focus={this.state.focus === 10}
              onEnter={()=>this.onEnter(11)}
              onClick={()=>this.onEnter(10)}
              />
          </div>)
    }
  }

  changeTab(tabid){
    console.log("CHANGE", tabid)
    this.setState({tabActive: tabid})
  }

  showCompanyFacts(value, state) {
    //console.log("STAGE", this.state)
    return (
      <div className="optionsFormularBlock">
        <div style={{width: "100%"}}>
          <div className="inputBox">
            <span className="inputBoxTitle">Company Name</span>
            {state.tabActive===1?<GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Example Inc"
            onBlur={(value) => this.setState({"companyname": value})}
            focus={this.state.focus===0}
            onEnter={()=>this.onEnter(2)}
            onClick={()=>this.onEnter(0)}
            tabIndex="0"
            />: <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Example Inc"
            onBlur={(value) => this.setState({"companyname": value})}
            focus={this.state.focus===0}
            onEnter={()=>this.onEnter(1)}
            onClick={()=>this.onEnter(0)}
            tabIndex="0"
            />}
            {this.state.noCompanyName ? <span className="inputBoxAdvisorError">Please insert a company name.</span> : ""}
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
            <div className={this.state.tabActive===1?"tab tabActive": "tab"} onClick={() => this.changeTab(1)}>Existing Company</div>
            <div className={this.state.tabActive===2?"tab tabActive": "tab"} onClick={() => this.changeTab(2)}>Implementation phase</div>
            <div className={this.state.tabActive===3?"tab tabActive": "tab"} onClick={() => this.changeTab(3)}>Idea phase</div>
          </div>
          <div>
        <div className="inputBox">
          <span className="inputBoxTitle">Address</span>
          {state.tabActive===1?<input
            className="inputBoxField"
            placeholder=""
            value={state.companyname || "Please add company name above"}
            disabled
            style={{ backgroundColor: "white" }}
          />:
          <GenericInputField
            tabIndex="1"
            fieldClass="inputBoxField"
            divClass=""
            placeholder="First Line"
            onBlur={(value) => this.setState({"addressFirstLine": value})}
            focus={this.state.focus===1}
            onEnter={()=>this.onEnter(2)}
            onClick={()=>this.onEnter(1)}
            />}
          <GenericInputField
          tabIndex="2"
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Second Line"
            onBlur={(value) => this.setState({"addressSecondLine": value})}
            focus={this.state.focus===2}
            onEnter={()=>this.onEnter(3)}
            onClick={()=>this.onEnter(2)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Street"
            onBlur={(value) => this.setState({"addressStreet": value})}
            focus={this.state.focus===3}
            onEnter={()=>this.onEnter(4)}
            onClick={()=>this.onEnter(3)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="City"
            onBlur={(value) => this.setState({"addressCity": value})}
            focus={this.state.focus===4}
            onEnter={()=>this.onEnter(5)}
            onClick={()=>this.onEnter(4)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Zip"
            onBlur={(value) => this.setState({"addressZip": value})}
            focus={this.state.focus===5}
            onEnter={()=>this.onEnter(6)}
            onClick={()=>this.onEnter(5)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="State"
            onBlur={(value) => this.setState({"addressState": value})}
            focus={this.state.focus===6}
            onEnter={()=>this.onEnter(7)}
            onClick={()=>this.onEnter(6)}
            />
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Country"
            default="US"
            noteditable={true}
            onBlur={(value) => this.setState({"addressCountry": value})}
            focus={this.state.focus===7}
            onEnter={()=>this.onEnter(8)}
            onClick={()=>this.onEnter(7)}
            />
        </div>
        {this.showRevenue(this.state.tabActive)}
        {this.showStart(this.state.tabActive)}
        <div className="inputBox">
          <span className="inputBoxTitle">Number of Employees</span>
          <GenericInputField
            fieldClass="inputBoxField"
            divClass="inputBoxHolder"
            placeholder="Number of Employees"
            onBlur={(value) => this.setState({"numberOfEmployees": value})}
            inputType="number"
            focus={this.state.focus === 11}
            onClick={()=>this.onEnter(11)}
            onEnter={() => this.saveFacts(value)}
            />
        </div>
      </div>
          <div className="advisorBottomPageButtonsHolder">
            <button
              className="advisorBottomPageButtonNext"
              onClick={() => this.saveFacts(value)}>
              Save and go to the next and last page
            </button>
          </div>
        </div>
      </div>
    );
  }

  saveFacts = async value => {
    //console.log("SaveFacts", this);

    //Check if companyname is set
    if (!this.state.companyname) {
      this.setState({noCompanyName: true})
      return
    }
    const statisticdata = {
      industry: this.state.industry, subindustry: this.state.subindustry, thisYearRevenue: this.state.thisYearRevenue, lastYearRevenue: this.state.lastYearRevenue,
      thisYearExpectedRevenue: this.state.thisYearExpectedRevenue, nextYearExpectedRevenue: this.state.nextYearExpectedRevenue,foundingYearOfCompany: this.state.foundingYearOfCompany
      expectedYearOfMarketEntry: this.state.expectedYearOfMarketEntry, numberOfEmployees: this.state.numberOfEmployees}

      //console.log("STATDATA", statisticdata)

    try {
      const res = await this.props.cc({ variables:  {name: this.state.companyname}  });
      const { ok, token, refreshToken } = res.data.createCompany;
      //console.log(res.data.createCompany);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      const res2 = await this.props.cA({ variables: {addressData: {country: this.state.addressCountry, state: this.state.addressState, city: this.state.addressCity, zip: this.state.addressZip, street: this.state.addressStreet, tags: ["main"]}, department: true}});

      const res3 = await this.props.uSD({ variables: {data: {...statisticdata} }});


      this.props.moveTo("/area/advisor/personfacts")
    } catch (err) {
      //console.log("ERROR SAVE", err);
      return;
    }
  }

  showExplainBlock(stage) {
    switch(stage) {
      case 1:
    return (
      <div className="optionsExplainBlock">
        <div className="optionsExplainTextHolder">
          <i className="far fa-building optionsExplainIconHolder" />
          <span className="optionsExplainHeading">Tell us a bit about your Company</span>
          <p>
            We use this information to set up your VIPFY-Account, find the best fitting services for
            you and provide general data to the service Providers. Most informationen is not mandatory but they will give you an better experience on VIPFY.
          </p>
        </div>
      </div>
    );
    case 2:
    return (
      <div className="optionsExplainBlock">
        <div className="optionsExplainTextHolder">
          <i className="far fa-user optionsExplainIconHolder" />
          <span className="optionsExplainHeading">Tell us a bit about yourself</span>
          <p>
            We use this information to set up your VIPFY-Account, find the best fitting services for
            you and provide general data to the service Providers. Most informationen is not mandatory but they will give you an better experience on VIPFY.
          </p>
        </div>
      </div>
    );
  }
  }

  editPart(state, value){
    switch(state.advisorStage){
      case 1: return(this.showCompanyFacts(value, state))
      case 2: return(this.showYourFacts(value, state))
    }
  }

  showYourFacts(value, state){
    return (
      <div className="optionsFormularBlock">
        <div style={{width: "100%"}}>
          <div className="inputBox">
          <span className="inputBoxTitle">Your Name</span>
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Your Name"
            onBlur={(value) => this.setState({"adminname": value})}
            focus={this.state.focus===0}
            onEnter={()=>this.onEnter(1)}
            onClick={()=>this.onEnter(0)}
            />
          </div>
          <div className="inputBox">
          <span className="inputBoxTitle">Your Age</span>
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Your Age"
            onBlur={(value) => this.setState({"adminage": value})}
            focus={this.state.focus===1}
            onEnter={()=>this.onEnter(2)}
            onClick={()=>this.onEnter(1)}
            />
          </div>
          <div className="inputBox">
            <span className="inputBoxTitle">Education</span>
            <select
              placeholder="Select Education"
              onChange={e => this.setEducation(e.target.value)}
              defaultValue="">
              <option value="" disabled hidden>
                Please choose your highest Education
              </option>
              <option value="highschool">
              Highschool or equivalent
              </option>
              <option value="college">
              College or equivalent
              </option>
              <option value="associate‎">
              Associate or equivalent
              </option>
              <option value="bachelor">
              Bachelor or equivalent
              </option>
              <option value="master">
              Master or equivalent
              </option>
              <option value="phd">
              PHD or other doctoral degree or equivalent
              </option>
              </select>
              </div>

              <div className="inputBox">
            <span className="inputBoxTitle">Job Category</span>
            <select
              placeholder="Select Job Category"
              onChange={e => this.setJobCategory(e.target.value)}
              defaultValue="">
              <option value="" disabled hidden>
                Please choose your Job Category
              </option>
              <option value="accounting">
              Accounting
              </option>
              <option value="adminClerical">
              Admin & Clerical
              </option>
              <option value="automotive">
              Automotive
              </option>
              <option value="banking">
              Banking
              </option>
              <option value="biotech">
              Biotech
              </option>
              <option value="broadcastJournalism">
              Broadcast - Journalism
              </option>
              <option value="businessDevelopment">
              Business Development
              </option>
              <option value="construction">
              Construction
              </option>
              <option value="consultant">
              Consultant
              </option>
              <option value="customerService">
              Customer Service
              </option>
              <option value="design">
              Design
              </option>
              <option value="distributionShipping">
              Distribution - Shipping
              </option>
              <option value="educationTeaching">
              Education - Teaching
              </option>
              <option value="engineering">
              Engineering
              </option>
              <option value="entryLevelNewGrad">
              Entry Level - New Grad
              </option>
              <option value="executive">
              Executive
              </option>
              <option value="facilities">
              Facilities
              </option>
              <option value="finance">
              Finance
              </option>
              <option value="franchise">
              Franchise
              </option>
              <option value="generalBusiness">
              General Business
              </option>
              <option value="generalLabor">
              General Labor
              </option>
              <option value="government">
              Government
              </option>
              <option value="grocery">
              Grocery
              </option>
              <option value="healthCare">
              Health Care
              </option>
              <option value="hotelHospitality">
              Hotel - Hospitality
              </option>
              <option value="humanResources">
              Human Resources
              </option>
              <option value="informationTechnology">
              Information Technology
              </option>
              <option value="installationMaintRepair">
              Installation - Maint - Repair
              </option>
              <option value="insurance">
              Insurance
              </option>
              <option value="inventory">
              Inventory
              </option>
              <option value="legal">
              Legal
              </option>
              <option value="legalAdmin">
              Legal Admin
              </option>
              <option value="management">
              Management
              </option>
              <option value="manufacturing">
              Manufacturing
              </option>
              <option value="marketing">
              Marketing
              </option>
              <option value="mediaJournalismNewspaper">
              Media - Journalism - Newspaper
              </option>
              <option value="nonprofitSocialServices">
              Nonprofit - Social Services
              </option>
              <option value="nurse">
              Nurse
              </option>
              <option value="other">
              Other
              </option>
              <option value="pharmaceutical">
              Pharmaceutical
              </option>
              <option value="professionalServices">
              Professional Services
              </option>
              <option value="purchasingProcurement">
              Purchasing - Procurement
              </option>
              <option value="qAQualityControl">
              QA - Quality Control
              </option>
              <option value="realEstate">
              Real Estate
              </option>
              <option value="research">
              Research
              </option>
              <option value="restaurantFoodService">
              Restaurant - Food Service
              </option>
              <option value="retail">
              Retail
              </option>
              <option value="sales">
              Sales
              </option>
              <option value="science">
              Science
              </option>
              <option value="skilledLaborTrades">
              Skilled Labor - Trades
              </option>
              <option value="strategyPlanning">
              Strategy - Planning
              </option>
              <option value="supplyChain">
              Supply Chain
              </option>
              <option value="telecommunications">
              Telecommunications
              </option>
              <option value="training">
              Training
              </option>
              <option value="transportation">
              Transportation
              </option>
              <option value="warehouse">
              Warehouse
              </option>
              </select>
              </div>

              <div className="inputBox">
          <span className="inputBoxTitle">Your workexperience in this job</span>
            <GenericInputField
            fieldClass="inputBoxField"
            divClass=""
            placeholder="Your workexperience in this job"
            onBlur={(value) => this.setState({"workexperience": value})}
            focus={this.state.focus===2}
            onEnter={() => this.saveUserFacts(value)}
            onClick={()=>this.onEnter(2)}
            />
          </div>
          <div className="advisorBottomPageButtonsHolder">
            {/*<button
              className="advisorBottomPageButtonNext"
              onClick={() => value.moveTo("/area/advisor/personfacts")}>
              Save and edit your settings
            </button>*/}
            <button
              className="advisorBottomPageButtonNext"
              onClick={() => this.saveUserFacts(value)}>
              Save and go to your dashboard
            </button>
          </div>
        </div>
      </div>)
  }

  saveUserFacts = async (value) => {
    let user = {};
      if (this.state.adminname) {
      if (this.state.adminname != "") {
        let nameArray = [];
        nameArray = this.state.adminname.split(" ");
        if (nameArray.length === 1) {
          user = { lastname: nameArray[0] };
        } else if (nameArray.length === 2) {
          user = { firstname: nameArray[0], lastname: nameArray[1] };
        } else {
          let middleArray = nameArray.slice(0);
          middleArray.pop();
          middleArray.shift();
          user = {
            firstname: nameArray[0],
            middlename: middleArray.join(" "),
            lastname: nameArray[nameArray.length - 1]
          };
        }
      }
    }

    user = {...user, statisticdata: {age: this.state.adminage, education: this.state.education, jobCategory: this.state.jobCategory, workexperience: this.state.workexperience}}

    //console.log("USER", user)
    try {
      const res = this.props.uU({variables: {user}})
      this.props.setName(user.firstname, user.lastname)
      this.props.moveTo("/area/dashboard")
    } catch (err) {
      //console.log("ERROR SAVE", err);
      return;
    }
  }

  render() {
    return (
      <AppContext.Consumer>
        {value => {
          //console.log("ADVISOR", this.props, value);
          return (
            <div className="optionsHolder">
              <AdvisorSidebar
              moveTo = {this.props.moveTo}
              stage = {this.state.advisorStage}
              />
              {this.editPart(this.state, value)}
              {/*this.showCompanyFacts(value, this.state)*/}
              {this.showExplainBlock(this.state.advisorStage)}
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
  }),
  graphql(createAddress, {
    name: "cA"
  })
)(Advisor);
