declare var window: any;

export default {
    apiUrl: window.baseUrl,
    greyTheme: "grey-theme",
    blackTheme: "black-theme"
};

export enum Theme {
    Black,
    Grey
}
