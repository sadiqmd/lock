import React from 'react';
import Screen from '../../core/screen';
import SocialButtonsPane from '../../field/social/social_buttons_pane';
import PaneSeparator from '../../core/pane_separator';
import {
  databaseConnection,
  databaseUsernameValue,
  defaultDatabaseConnection,
  hasInitialScreen,
  hasScreen,
  signUpLink
} from '../../connection/database/index';
import { logIn as databaseLogIn, showLoginActivity } from '../../connection/database/actions';
import { renderSignedInConfirmation } from '../../core/signed_in_confirmation';
import LoginSignUpTabs from '../../connection/database/login_sign_up_tabs';
import * as l from '../../core/index';
import { logIn as enterpriseLogIn, startHRD } from '../../connection/enterprise/actions';

import { authButtonsTheme } from '../../connection/social/index';
import QuickAuthPane from '../../ui/pane/quick_auth_pane';
import { logIn as quickAuthLogin } from '../../quick-auth/actions';

import { defaultEnterpriseConnection, isHRDDomain } from '../../connection/enterprise';
import SingleSignOnNotice from '../../connection/enterprise/single_sign_on_notice';
import { hasOnlyClassicConnections, isSSOEnabled, useBigSocialButtons } from '../classic';
import * as i18n from '../../i18n';

function shouldRenderTabs(m) {
  if (isSSOEnabled(m)) return false;
  if (l.hasSomeConnections(m, 'database')) return hasScreen(m, 'signUp');
  if (l.hasSomeConnections(m, 'social') && hasInitialScreen(m, 'signUp'))
    return hasScreen(m, 'signUp');
}

const Component = ({ i18n, model }) => {
  const sso = isSSOEnabled(model);
  const onlySocial = hasOnlyClassicConnections(model, 'social');

  const tabs = shouldRenderTabs(model) && (
    <LoginSignUpTabs
      key="loginsignup"
      lock={model}
      loginLabel={i18n.str('loginLabel')}
      signUpLink={signUpLink(model)}
      signUpLabel={i18n.str('signUpLabel')}
    />
  );

  const social = l.hasSomeConnections(model, 'social') && (
    <SocialButtonsPane
      bigButtons={useBigSocialButtons(model)}
      instructions={i18n.html('socialLoginInstructions')}
      labelFn={i18n.str}
      lock={model}
      showLoading={onlySocial}
      signUp={false}
    />
  );

  let enterprise = null;
  let enterpriseClient = null;
  if (l.hasSomeConnections(model, 'enterprise')) {
    const connection = l.connections(model, 'enterprise').get(0);
    const connectionName = connection.getIn(['name']);
    const connectionDomain = connection.getIn(['domains', 0]);

    const headerText = i18n.html('enterpriseLoginIntructions') || null;
    const header = headerText && <p>{headerText}</p>;

    const theme = authButtonsTheme(model);
    const buttonTheme = theme.get(connection.get('name'));
    const buttonLabel =
      (buttonTheme && buttonTheme.get('displayName')) ||
      (connectionDomain && i18n.str('loginAtLabel', connectionDomain)) ||
      i18n.str('loginAtLabel', connectionName);
    const primaryColor = buttonTheme && buttonTheme.get('primaryColor');
    const foregroundColor = buttonTheme && buttonTheme.get('foregroundColor');

    enterprise = l.hasSomeConnections(model, 'enterprise') && (
      <QuickAuthPane
        buttonLabel={buttonLabel}
        buttonClickHandler={e => quickAuthLogin(l.id(model), connection)}
        header={header}
        primaryColor={primaryColor}
        foregroundColor={foregroundColor}
        strategy={'auth0'}
      />
    );

    enterpriseClient = l.hasSomeConnections(model, 'enterprise') && (
      <QuickAuthPane
        buttonLabel="Client user"
        buttonClickHandler={e => showLoginActivity(1)}
        primaryColor={primaryColor}
        foregroundColor={foregroundColor}
        strategy={'auth0'}
      />
    );
  }

  const ssoNotice = sso && <SingleSignOnNotice>{i18n.str('ssoEnabled')}</SingleSignOnNotice>;

  const separator = (enterprise || social) && <PaneSeparator />;

  return (
    <div>
      {ssoNotice}
      {tabs}
      {social}
      {enterprise}
      {separator}
      {enterpriseClient}
    </div>
  );
};

export default class LoginClient extends Screen {
  constructor() {
    super('main.loginClient');
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  renderTabs(model) {
    return shouldRenderTabs(model);
  }

  submitButtonLabel(m) {
    return i18n.str(m, ['loginSubmitLabel']);
  }

  isSubmitDisabled(m) {
    // it should disable the submit button if there is any connection that
    // requires username/password and there is no enterprise with domain
    // that matches with the email domain entered for HRD
    return true; // no matching domain
  }

  submitHandler(model) {
    if (hasOnlyClassicConnections(model, 'social')) {
      return null;
    }

    if (isHRDDomain(model, databaseUsernameValue(model))) {
      return id => startHRD(id, databaseUsernameValue(model));
    }

    const useDatabaseConnection =
      !isSSOEnabled(model) &&
      databaseConnection(model) &&
      (defaultDatabaseConnection(model) || !defaultEnterpriseConnection(model));

    return useDatabaseConnection ? databaseLogIn : enterpriseLogIn;
  }

  render() {
    return Component;
  }
}
