// js-cookie.d.ts
declare module 'js-cookie' {
    interface CookiesStatic {
        set(name: string, value: string | object, options?: Cookies.CookieAttributes): void;
        get(name: string): string | undefined;
        remove(name: string, options?: Cookies.CookieAttributes): void;
    }

    const Cookies: CookiesStatic;
    export default Cookies;
}
