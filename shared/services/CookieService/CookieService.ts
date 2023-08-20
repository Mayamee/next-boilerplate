type ExpireSettings = {
  offset?: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
  expirationDate?: Date;
};

type Cookie = {
  name: string;
  value: string;
  expireSettings?: ExpireSettings;
  path?: string; // By default, the path is /, which means that the cookie is visible on all pages.
  onlyHttps?: boolean;
  samesite?: "strict" | "lax" | "none";
  /* https://learn.javascript.ru/cookie#nastroyka-samesite */
};

class CookieService {
  private isBrowserEnvironment: boolean = typeof window !== "undefined";
  /**
   * Устанавливает cookie.
   *
   * @param {Cookie} cookie - Объект cookie, который нужно установить.
   * @returns {void}
   * @throws {Error} Если заданы и `expirationDate`, и `offset`.
   */
  setCookie = (cookie: Cookie): void => {
    if (!this.isBrowserEnvironment) {
      return;
    }

    if (
      cookie.expireSettings?.expirationDate &&
      cookie.expireSettings?.offset
    ) {
      throw new Error(
        "You can't set both expirationDate and offset in the same cookie"
      );
    }

    let expires = "";

    if (cookie.expireSettings) {
      const date = new Date();

      if (cookie.expireSettings?.expirationDate) {
        date.setTime(cookie.expireSettings.expirationDate.getTime());
      } else if (cookie.expireSettings?.offset) {
        const { days, hours, minutes, seconds } = cookie.expireSettings.offset;
        date.setTime(
          date.getTime() +
            (days ?? 0) * 86400000 +
            (hours ?? 0) * 3600000 +
            (minutes ?? 0) * 60000 +
            (seconds ?? 0) * 1000
        );
      } else {
        date.setTime(date.getTime() + 86400000);
      }

      expires = `expires=${date.toUTCString()};`;
    }

    document.cookie = `${encodeURIComponent(cookie.name)}=${encodeURIComponent(
      cookie.value
    )};${expires};path=${cookie.path ?? "/"};${
      cookie.onlyHttps ? "secure" : ""
    };samesite=${cookie.samesite ?? "lax"}`;
  };

  /**
   * Получает значение cookie по имени.
   *
   * @param {string} name - Имя cookie.
   * @returns {string|undefined} Значение cookie или undefined, если cookie не найден.
   */
  getCookie = (name: string): string | undefined => {
    if (!this.isBrowserEnvironment) {
      return;
    }

    const cookieValue = document.cookie
      .replaceAll(" ", "")
      .split(";")
      .map((cookie) => cookie.split("="))
      .find((cookie) => decodeURIComponent(cookie[0]) === name)?.[1];

    return cookieValue ? decodeURIComponent(cookieValue) : undefined;
  };

  /**
   * Удаляет cookie по имени.
   *
   * @param {string} name - Имя cookie, которую нужно удалить.
   * @returns {void}
   */
  removeCookie = (name: string): void => {
    if (!this.isBrowserEnvironment) {
      return;
    }

    document.cookie = `${encodeURIComponent(
      name
    )}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  };

  /**
   * Асинхронно устанавливает cookie.
   *
   * @param {Cookie} cookie - Объект cookie, который нужно установить.
   * @returns {Promise<void>}
   * @throws {Error} Если заданы и `expirationDate`, и `offset`.
   */
  setCookieAsync = async (cookie: Cookie) => this.setCookie(cookie);
  /**
   * Асинхронно получает значение cookie по имени.
   *
   * @param {string} name - Имя cookie.
   * @returns {Promise<string|undefined>} Значение cookie или undefined, если cookie не найден.
   */
  getCookieAsync = async (name: string) => this.getCookie(name);
  /**
   * Асинхронно удаляет cookie по имени.
   *
   * @param {string} name - Имя cookie, которую нужно удалить.
   * @returns {Promise<void>}
   */
  removeCookieAsync = async (name: string) => this.removeCookie(name);
}

const cookieService = new CookieService();

export { cookieService as CookieService };
