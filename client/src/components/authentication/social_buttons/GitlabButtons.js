import React from "react";
import {createButton} from "react-social-login-buttons";

const config = {
  text: "Log in with Gitlab",
  icon: "gitlab",
  iconFormat: name => `fa fa-${name}`,
  style: { background: "#fc6d27" },
  activeStyle: { background: "#e2432a" }
};
const GitlabLoginButton = createButton(config);

export default GitlabLoginButton;