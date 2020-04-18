import * as rp from "request-promise";
import * as r from "request";

export class TestClient {
  url: string;
  options: {
    jar: r.CookieJar;
    withCredentials: boolean;
    json: boolean;
  };

  constructor(url: string) {
    this.url = url;
    this.options = {
      jar: rp.jar(),
      withCredentials: true,
      json: true,
    };
  }

  register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            register(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `,
      },
    });
  }

  login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            login(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `,
      },
    });
  }

  logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            logout
          }
        `,
      },
    });
  }

  me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `,
      },
    });
  }
}
