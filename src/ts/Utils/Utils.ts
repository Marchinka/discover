import Constants, { Theme } from "./Constants";

export default {
    urlCombine(...fragements: string[]) {
        let safeFragements = [] as string[];
        fragements.forEach(fragement => {
            let newFragement = fragement;
            if(!newFragement) {
                return "";
            }
            if (newFragement.charAt(0) == "/") {
                newFragement = newFragement.substr(1)
            }
            if (newFragement.charAt(newFragement.length -1) == "/") {
                newFragement = newFragement.substr(0, newFragement.length -1);
            }
            safeFragements.push(newFragement);
        });
        let url = safeFragements.join("/");
        return url;
    },

    getTheme() {
        let theme = localStorage.getItem("app-theme") || "";
        if (!theme) {
            localStorage.setItem("app-theme", Constants.blackTheme);
        }

        if (theme.toLowerCase() === Constants.greyTheme) {
            return Theme.Grey;
        } else {
            return Theme.Black; 
        }
    },

    switchTheme() {
        let theme = this.getTheme();
        switch (theme) {
            case Theme.Black:
                localStorage.setItem("app-theme", Constants.greyTheme);
                break;
            case Theme.Grey:
                localStorage.setItem("app-theme", Constants.blackTheme);
                break;
        }
    },

    displayIf(show: Boolean) {
        if (show) {
            return "";
        } else {
            return "d-none";
        }
    }
}