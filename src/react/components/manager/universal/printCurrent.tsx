import * as React from "react";

interface Props {
  elements: any[];
  onClick: Function;
  onDragStart: Function;
  integrate: any;
}

interface State {}

class PrintCurrent extends React.Component<Props, State> {
  render() {
    console.log("PRINT", this.props.elements);
    let elementArray: JSX.Element[] = [];
    this.props.elements.forEach(element => {
      elementArray.push(
        <div
          key={element.id}
          className="space"
          draggable={element.dragable}
          onDragStart={() => this.props.onDragStart(element)}
          onClick={() => this.props.onClick(element)}>
          <div
            className="image"
            style={
              element.profilepicture
                ? element.profilepicture.indexOf("/") != -1
                  ? {
                      backgroundImage: encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                          element.profilepicture
                        )})`
                      )
                    }
                  : {
                      backgroundImage: encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                          element.profilepicture
                        })`
                      )
                    }
                : { backgroundColor: "#5D76FF" }
            }>
            {element.profilepicture ? "" : element.firstname && element.firstname.slice(0, 1)}
          </div>
          <div className="name">{`${element.firstname} ${element.lastname}`}</div>
          {element.dragable ? (
            <div className="imageHover">
              <i className="fal fa-trash-alt" />
              <span>Click or drag to remove</span>
            </div>
          ) : (
            <React.Fragment>
              <div className="greyed" />
              <div className="ribbon ribbon-top-right">
                <span>Used Licence</span>
              </div>
            </React.Fragment>
          )}
        </div>
      );
    });
    let j = 0;
    if (this.props.integrate) {
      const employee = this.props.integrate;
      elementArray.push(
        <div className="space" key={employee.id}>
          <div
            className="image"
            style={
              employee.profilepicture
                ? employee.profilepicture.indexOf("/") != -1
                  ? {
                      backgroundImage: encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                          employee.profilepicture
                        )})`
                      )
                    }
                  : {
                      backgroundImage: encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                          employee.profilepicture
                        })`
                      )
                    }
                : { backgroundColor: "#5D76FF" }
            }>
            {employee.profilepicture ? "" : employee.firstname.slice(0, 1)}
          </div>
          <div className="name">{`${employee.firstname} ${employee.lastname}`}</div>
          <div className="imageCog">
            <i className="fal fa-cog fa-spin" />
            <span>Editing this licence</span>
          </div>
        </div>
      );
      j = 1;
    }
    let i = 0;
    while (
      (this.props.elements.length + j + i) % 4 != 0 ||
      this.props.elements.length + j + i < 12 ||
      i == 0
    ) {
      elementArray.push(
        <div className="space" key={`fake-${i}`}>
          <div className="fakeimage" />
          <div className="fakename" />
        </div>
      );
      i++;
    }
    return elementArray;
  }
}
export default PrintCurrent;
