import * as React from "react";
import GenericInputField from "./GenericInputField";

interface Props {
  activeedit: number;
  editid: number;
  original: any;
  original2?: any;
  onSave: Function;
  setEditState: Function;
  default: any;
  norevert?: boolean;
  nodelete?: boolean;
  nochange?: boolean;
  type?: string;
  formtype?: string;
  zip?: string;
  city?: string;
}

interface State {
  editfield: any;
  editfield2: any;
  editfield3: any;
  editchanged: boolean;
}

class EditFieldRDS extends React.Component<Props, State> {
  state = {
    editfield: null,
    editfield2: null,
    editfield3: null,
    editchanged: false
  };

  render() {
    return this.props.activeedit == this.props.editid ? (
      <React.Fragment>
        <i
          className={`fal fa-undo-alt revertInlineButton ${(this.props.norevert ||
            this.props.nochange) &&
            "disabled"}`}
          onClick={() => {
            this.setState({
              editfield: this.props.original,
              editchanged: false,
              editfield2: this.props.original2 || this.props.zip,
              editfield3: this.props.city
            });
          }}
          style={this.props.original2 || this.props.formtype == "address" ? { top: "13px" } : {}}
        />
        <i
          className={`fal fa-trash-alt deleteInlineButton ${(this.props.nodelete ||
            this.props.nochange) &&
            "disabled"}`}
          onClick={() =>
            !this.props.nodelete &&
            !this.props.nochange &&
            this.setState({
              editfield: null,
              editchanged: true,
              editfield2: null,
              editfield3: null
            })
          }
          style={this.props.original2 || this.props.formtype == "address" ? { top: "13px" } : {}}
        />
        <i
          className={`fal fa-save adminInlineButton ${this.props.nochange && "disabled"}`}
          onClick={() =>
            !this.props.nochange &&
            this.props.onSave(
              this.props.original2
                ? [this.state.editfield, this.state.editfield2]
                : this.props.formtype == "address"
                ? [this.state.editfield, this.state.editfield2, this.state.editfield3]
                : this.state.editfield
            )
          }
          style={this.props.original2 || this.props.formtype == "address" ? { top: "13px" } : {}}
        />
        {this.state.editchanged ? (
          <span
            className="unsavedInline"
            style={this.props.original2 || this.props.formtype == "address" ? { top: "40px" } : {}}>
            unsaved
          </span>
        ) : (
          ""
        )}
        {this.props.original2 || this.props.formtype == "address" ? (
          <div>
            <div className="twoLineContent">
              <GenericInputField
                fieldClass="inlineInput"
                default={this.state.editfield || this.props.default}
                forceprop={true}
                type={this.props.type}
                onChange={value => this.setState({ editchanged: true, editfield: value })}
                noteditable={this.props.nochange}
                width="170px"
              />
            </div>
            {this.props.formtype == "address" ? (
              <div className="twoLineContent">
                <GenericInputField
                  fieldClass="inlineInput"
                  default={this.state.editfield2 || this.props.default}
                  forceprop={true}
                  type={this.props.type}
                  onChange={value => this.setState({ editchanged: true, editfield2: value })}
                  noteditable={this.props.nochange}
                  width="55px"
                />
                <GenericInputField
                  fieldClass="inlineInput"
                  default={this.state.editfield3 || this.props.default}
                  forceprop={true}
                  type={this.props.type}
                  onChange={value => this.setState({ editchanged: true, editfield3: value })}
                  noteditable={this.props.nochange}
                  width="110px"
                  marginLeft="5px"
                />
              </div>
            ) : (
              <div className="twoLineContent">
                <GenericInputField
                  fieldClass="inlineInput"
                  default={this.state.editfield2 || this.props.default}
                  forceprop={true}
                  type={this.props.type}
                  onChange={value => this.setState({ editchanged: true, editfield2: value })}
                  noteditable={this.props.nochange}
                  width="170px"
                />
              </div>
            )}
          </div>
        ) : (
          <GenericInputField
            fieldClass="inlineInput"
            default={this.state.editfield || this.props.default}
            forceprop={true}
            type={this.props.type}
            onChange={value => this.setState({ editchanged: true, editfield: value })}
            noteditable={this.props.nochange}
            width="170px"
          />
        )}
      </React.Fragment>
    ) : (
      <React.Fragment>
        <i
          className="fal fa-edit adminInlineButton"
          onClick={() => {
            this.setState({
              editchanged: false,
              editfield: this.props.original,
              editfield2: this.props.original2 || this.props.zip,
              editfield3: this.props.city
            });
            this.props.setEditState(this.props.editid);
          }}
          style={this.props.original2 || this.props.formtype == "address" ? { top: "13px" } : {}}
        />
        {this.props.original2 || this.props.formtype == "address" ? (
          <div>
            <div className="twoLineContent">{this.props.original}</div>
            <div className="twoLineContent">
              {this.props.original2 ||
                (this.props.zip && this.props.city && `${this.props.zip} ${this.props.city}`) ||
                ""}
            </div>
          </div>
        ) : (
          <span>{this.props.original}</span>
        )}
      </React.Fragment>
    );
  }
}
export default EditFieldRDS;
