import * as React from "react";
import Dropzone from "react-dropzone";
import { graphql } from "@apollo/client/react/hoc";
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
            file: { name: file.name, type: file.type, size: file.size, path: file.path }
          }
        });
      }}>
      {children}
    </Dropzone>
  );
};

export default graphql(MUTATION_SENDMESSAGE)(FileUpload);
