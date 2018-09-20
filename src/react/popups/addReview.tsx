import * as React from "react";
import { Component } from "react";

import { Editor } from "react-draft-wysiwyg";
import { convertToRaw } from "draft-js";

const content = {
  entityMap: {},
  blocks: [
    {
      key: "637gr",
      text: "Initialized from content state.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ]
};

class AddReview extends Component {
  state = {
    editorState: content
  };

  onEditorStateChange = editorState => {
    this.setState({
      editorState
    });
  };
  render() {
    return (
      <div className="editorMainHolder">
        <div className="editorHolder">
          <Editor
            toolbar={{
              options: ["inline", "blockType", "list", "remove", "history"],
              inline: {
                options: ["bold", "italic", "underline", "strikethrough"]
              }
            }}
            placeholder="Please type your review here"
            autoFocus="true"
            onEditorStateChange={this.onEditorStateChange}
          />
        </div>
        <div className="addReviewButtonHolder">
          <button
            className="addReviewButton"
            onClick={() =>
              this.props.handleAdd(1, convertToRaw(this.state.editorState.getCurrentContent()))
            }>
            <i className="fas fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
          </button>
          <button
            className="addReviewButton"
            onClick={() =>
              this.props.handleAdd(2, convertToRaw(this.state.editorState.getCurrentContent()))
            }>
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
          </button>
          <button
            className="addReviewButton"
            onClick={() =>
              this.props.handleAdd(3, convertToRaw(this.state.editorState.getCurrentContent()))
            }>
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="far fa-star" />
            <i className="far fa-star" />
          </button>
          <button
            className="addReviewButton"
            onClick={() =>
              this.props.handleAdd(4, convertToRaw(this.state.editorState.getCurrentContent()))
            }>
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="far fa-star" />
          </button>
          <button
            className="addReviewButton"
            onClick={() =>
              this.props.handleAdd(5, convertToRaw(this.state.editorState.getCurrentContent()))
            }>
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
            <i className="fas fa-star" />
          </button>
        </div>
      </div>
    );
  }
}
export default AddReview;
