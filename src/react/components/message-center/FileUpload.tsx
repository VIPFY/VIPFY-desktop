import * as React from "react";
import * as Dropzone from "react-dropzone";
import { graphql } from "react-apollo";
import { MUTATION_SENDMESSAGE } from "./common";

const FileUpload = ({ children, disableClick, mutate, groupid }) => {
  return (
    <Dropzone
      className="ignore"
      disableClick={disableClick}
      onDrop={async ([file]) => {
        const res = await mutate({
          variables: {
            groupid,
            file
          }
        });
        console.log(res);
      }}>
      {children}
    </Dropzone>
  );
};

export default graphql(MUTATION_SENDMESSAGE)(FileUpload);
