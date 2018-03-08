import Auth0Lock from '../../../src/auth0-lock';

const cid = 'yKJO1ckwuY1X8gPEhTRfhJXyObfiLxih';
const domain = 'mdocs.auth0.com';

const lock = new Auth0Lock(cid, domain);

lock.show();
