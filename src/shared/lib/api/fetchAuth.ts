import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type SignupRequest = operations['signup_1']['requestBody']['content']['application/json'];
export type SignupResponse = operations['signup_1']['responses'][201]['content']['application/json'];
export type LoginRequest = operations['login_1']['requestBody']['content']['application/json'];
export type LoginResponse = operations['login_1']['responses'][200]['content']['application/json'];
export type GoogleLoginRequest = operations['googleLogin_1']['requestBody']['content']['application/json'];
export type GoogleLoginResponse = operations['googleLogin_1']['responses'][200]['content']['application/json'];
export type GithubLoginRequest = operations['githubLogin_1']['requestBody']['content']['application/json'];
export type GithubLoginResponse = operations['githubLogin_1']['responses'][200]['content']['application/json'];
export type RefreshRequest = NonNullable<operations['refresh_1']['requestBody']>['content']['application/json'];
export type RefreshResponse = operations['refresh_1']['responses'][200]['content']['application/json'];
export type DevSignupRequest = operations['signup']['requestBody']['content']['application/json'];
export type DevSignupResponse = operations['signup']['responses'][200]['content']['application/json'];
export type DevLoginRequest = operations['login']['requestBody']['content']['application/json'];
export type DevLoginResponse = operations['login']['responses'][200]['content']['application/json'];
export type DevGoogleLoginRequest = operations['googleLogin']['requestBody']['content']['application/json'];
export type DevGoogleLoginResponse = operations['googleLogin']['responses'][200]['content']['application/json'];
export type DevGithubLoginRequest = operations['githubLogin']['requestBody']['content']['application/json'];
export type DevGithubLoginResponse = operations['githubLogin']['responses'][200]['content']['application/json'];
export type DevRefreshRequest = NonNullable<operations['refresh']['requestBody']>['content']['application/json'];
export type DevRefreshResponse = operations['refresh']['responses'][200]['content']['application/json'];
export type GoogleAuthorizeUrlResponse =
  operations['getGoogleAuthorizeUrl_1']['responses'][200]['content']['application/json'];
export type GithubAuthorizeUrlResponse =
  operations['getGithubAuthorizeUrl_1']['responses'][200]['content']['application/json'];
export type DevGoogleAuthorizeUrlResponse =
  operations['getGoogleAuthorizeUrl']['responses'][200]['content']['application/json'];
export type DevGithubAuthorizeUrlResponse =
  operations['getGithubAuthorizeUrl']['responses'][200]['content']['application/json'];
export type GithubConnectRequest = operations['githubConnect_1']['requestBody']['content']['application/json'];
export type GithubConnectResponse = operations['githubConnect_1']['responses'][200]['content']['application/json'];
export type DevGithubConnectRequest = operations['githubConnect']['requestBody']['content']['application/json'];
export type DevGithubConnectResponse = operations['githubConnect']['responses'][200]['content']['application/json'];
export type GithubConnectAuthorizeUrlResponse =
  operations['getGithubConnectAuthorizeUrl_1']['responses'][200]['content']['application/json'];
export type DevGithubConnectAuthorizeUrlResponse =
  operations['getGithubConnectAuthorizeUrl']['responses'][200]['content']['application/json'];

class FetchAuth {
  postSignup = (body: SignupRequest) =>
    apiRequest<SignupResponse, SignupRequest>('/api/v1/auth/signup', {
      method: 'POST',
      body,
    });

  postDevSignup = (body: DevSignupRequest) =>
    apiRequest<DevSignupResponse, DevSignupRequest>('/api/v1/dev/auth/signup', {
      method: 'POST',
      body,
    });

  postLogin = (body: LoginRequest) =>
    apiRequest<LoginResponse, LoginRequest>('/api/v1/auth/login', {
      method: 'POST',
      body,
    });

  postDevLogin = (body: DevLoginRequest) =>
    apiRequest<DevLoginResponse, DevLoginRequest>('/api/v1/dev/auth/login', {
      method: 'POST',
      body,
    });

  postGoogleLogin = (body: GoogleLoginRequest) =>
    apiRequest<GoogleLoginResponse, GoogleLoginRequest>('/api/v1/auth/login/google', {
      method: 'POST',
      body,
    });

  postDevGoogleLogin = (body: DevGoogleLoginRequest) =>
    apiRequest<DevGoogleLoginResponse, DevGoogleLoginRequest>('/api/v1/dev/auth/login/google', {
      method: 'POST',
      body,
    });

  postGithubLogin = (body: GithubLoginRequest) =>
    apiRequest<GithubLoginResponse, GithubLoginRequest>('/api/v1/auth/oauth/github', {
      method: 'POST',
      body,
    });

  postDevGithubLogin = (body: DevGithubLoginRequest) =>
    apiRequest<DevGithubLoginResponse, DevGithubLoginRequest>('/api/v1/dev/auth/oauth/github', {
      method: 'POST',
      body,
    });

  postLogout = () =>
    apiRequest<void>('/api/v1/auth/logout', {
      method: 'POST',
    });

  postDevLogout = () =>
    apiRequest<void>('/api/v1/dev/auth/logout', {
      method: 'POST',
    });

  getGoogleAuthorizeUrl = () => apiRequest<GoogleAuthorizeUrlResponse>('/api/v1/auth/oauth/google/url');

  getGithubAuthorizeUrl = () => apiRequest<GithubAuthorizeUrlResponse>('/api/v1/auth/oauth/github/url');

  getDevGoogleAuthorizeUrl = () => apiRequest<DevGoogleAuthorizeUrlResponse>('/api/v1/dev/auth/oauth/google/url');

  getDevGithubAuthorizeUrl = () => apiRequest<DevGithubAuthorizeUrlResponse>('/api/v1/dev/auth/oauth/github/url');

  postGithubConnect = (body: GithubConnectRequest) =>
    apiRequest<GithubConnectResponse, GithubConnectRequest>('/api/v1/auth/oauth/github/connect', {
      method: 'POST',
      body,
    });

  postDevGithubConnect = (body: DevGithubConnectRequest) =>
    apiRequest<DevGithubConnectResponse, DevGithubConnectRequest>('/api/v1/dev/auth/oauth/github/connect', {
      method: 'POST',
      body,
    });

  getGithubConnectAuthorizeUrl = () =>
    apiRequest<GithubConnectAuthorizeUrlResponse>('/api/v1/auth/oauth/github/connect/url');

  getDevGithubConnectAuthorizeUrl = () =>
    apiRequest<DevGithubConnectAuthorizeUrlResponse>('/api/v1/dev/auth/oauth/github/connect/url');

  private isDev = process.env.NEXT_PUBLIC_USE_DEV_API === 'true';

  getGithubAuthorizeUrlByEnv = () => (this.isDev ? this.getDevGithubAuthorizeUrl() : this.getGithubAuthorizeUrl());

  getGoogleAuthorizeUrlByEnv = () => (this.isDev ? this.getDevGoogleAuthorizeUrl() : this.getGoogleAuthorizeUrl());

  postGithubConnectByEnv = (body: GithubConnectRequest) =>
    this.isDev ? this.postDevGithubConnect(body) : this.postGithubConnect(body);

  getGithubConnectAuthorizeUrlByEnv = () =>
    this.isDev ? this.getDevGithubConnectAuthorizeUrl() : this.getGithubConnectAuthorizeUrl();

  postGithubLoginByEnv = (body: GithubLoginRequest) =>
    this.isDev ? this.postDevGithubLogin(body) : this.postGithubLogin(body);

  postGoogleLoginByEnv = (body: GoogleLoginRequest) =>
    this.isDev ? this.postDevGoogleLogin(body) : this.postGoogleLogin(body);

  postLogoutByEnv = () => (this.isDev ? this.postDevLogout() : this.postLogout());
}

const fetchAuth = new FetchAuth();
export { fetchAuth };
