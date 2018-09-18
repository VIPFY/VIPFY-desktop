import * as React from "react";
import { Component } from "react";

import { Editor } from "react-draft-wysiwyg";

class AddReview extends Component {
  render() {
    console.log("AddReview", this.props);

    return (
      <div>
        <Editor />
      </div>
    );
  }
}
export default AddReview;
