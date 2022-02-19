import React from "react";
import {createButton} from "react-social-login-buttons";

const config = {
  text: "Log in with BitBucket",
  icon: "bitbucket",
  iconFormat: name => `fa fa-${name}`,
  style: { background: "#2684ff" },
  activeStyle: { background: "#0c61db" }
};
const BitbucketLoginButton = createButton(config);

export default BitbucketLoginButton;