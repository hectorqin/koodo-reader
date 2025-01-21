import React from "react";
import "./manager.css";
import { RedirectProps, RedirectState } from "./interface";
import { Trans } from "react-i18next";
import { getParamsFromUrl } from "../../utils/file/common";
import copy from "copy-text-to-clipboard";
import { withRouter } from "react-router-dom";
import Lottie from "react-lottie";

import animationSuccess from "../../assets/lotties/success.json";
import toast, { Toaster } from "react-hot-toast";
import ConfigService from "../../utils/storage/configService";
import * as Kookit from "../../assets/lib/kookit.min";
import { BookHelper } from "../../assets/lib/kookit-extra-browser.min";
declare var window: any;
const successOptions = {
  loop: false,
  autoplay: true,
  animationData: animationSuccess,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

class Redirect extends React.Component<RedirectProps, RedirectState> {
  timer!: NodeJS.Timeout;
  constructor(props: RedirectProps) {
    super(props);
    this.state = {
      isAuthed: false,
      isError: false,
      isCopied: false,
      token: "",
    };
  }
  handleFinish = () => {
    this.props.handleLoadingDialog(false);
    alert("数据恢复成功");
  };
  showMessage = (message: string) => {
    toast(this.props.t(message));
  };
  componentDidMount() {
    let url = document.location.href;
    if (document.location.hash === "#/" && url.indexOf("code") === -1) {
      this.props.history.push("/manager/home");
    }
    if (url.indexOf("error") > -1) {
      this.setState({ isError: true });
    }
    if (url.indexOf("import") > -1) {
      window.Kookit = Kookit;
      window.BookHelper = BookHelper;
    }
    if (url.indexOf("code") > -1) {
      let params: any = getParamsFromUrl();
      this.setState({ token: params.code });
      this.setState({ isAuthed: true });
      let state = params.state;
      if (state) {
        const encodedState = state.split("|")[1];
        const customParams = JSON.parse(decodeURIComponent(encodedState));
        if (customParams && customParams.deeplink) {
          window.location.replace(
            customParams.deeplink + "?code=" + params.code + "&state=" + state
          );
        }
      }
    }
    if (url.indexOf("access_token") > -1) {
      let params: any = getParamsFromUrl();
      this.setState({ token: params.access_token });
      this.setState({ isAuthed: true });
      let state = params.state;
      if (state) {
        const encodedState = state.split("|")[1];
        const customParams = JSON.parse(decodeURIComponent(encodedState));
        if (customParams && customParams.deeplink) {
          window.location.replace(
            customParams.deeplink +
              "?token=" +
              params.access_token +
              "&state=" +
              state
          );
        }
      }
    }
  }

  render() {
    if (this.state.isError || this.state.isAuthed) {
      return (
        <div className="backup-page-finish-container">
          <div className="backup-page-finish">
            {this.state.isAuthed ? (
              <Lottie options={successOptions} height={80} width={80} />
            ) : (
              <span className="icon-close auth-page-close-icon"></span>
            )}

            <div className="backup-page-finish-text">
              <Trans>
                {this.state.isAuthed
                  ? "Authorisation successful"
                  : "Authorisation failed"}
              </Trans>
            </div>
            {this.state.isAuthed ? (
              <div
                className="token-dialog-token-text"
                onClick={() => {
                  copy(this.state.token);
                  this.setState({ isCopied: true });
                }}
              >
                {this.state.isCopied ? (
                  <Trans>Copied</Trans>
                ) : (
                  <Trans>Copy token</Trans>
                )}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="manager">
        <div className="empty-page-info-container" style={{ margin: 100 }}>
          <div className="empty-page-info-main">
            <Trans>It seems like you're lost</Trans>
          </div>
          <div
            className="empty-page-info-sub"
            onClick={() => {
              this.props.history.push("/manager/home");
            }}
            style={{ marginTop: 10, cursor: "pointer" }}
          >
            <Trans>Return to home</Trans>
          </div>
        </div>
        <img
          src={
            ConfigService.getReaderConfig("appSkin") === "night" ||
            (ConfigService.getReaderConfig("appSkin") === "system" &&
              ConfigService.getReaderConfig("isOSNight") === "yes")
              ? "./assets/empty_dark.svg"
              : "./assets/empty.svg"
          }
          alt=""
          className="empty-page-illustration"
        />
        <Toaster />
      </div>
    );
  }
}

export default withRouter(Redirect as any);
