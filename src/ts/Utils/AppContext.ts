class AppContext {
    userInfo: UserInfo;

    constructor (userInfo: UserInfo) {
        this.userInfo = userInfo;
    }

    getUser() : UserInfo {
        return this.userInfo;
    }
}

class UserInfo {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
    functions: string[];

    constructor (
        id: string,
        email: string,
        lastName: string,
        firstName: string,
        functions: string[]) {
            
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.functions = functions;
    }

    hasFunction(func: string) : boolean {
        return this.functions.indexOf(func) >= 0;
    }

    fullName() : string {
        return this.firstName + " " + this.lastName;
    }
}

let appContext = null as AppContext;

export default {
    initialize: (callback: () => void) => {
        try {
            // HERE AJAX CALL 
            let userInfo = new UserInfo("1", "kilgore.trout@techedgegroup.com", "Trout", "Kilgore", ["Delete"]);
            appContext = new AppContext(userInfo);
            callback();
        } catch (e) {
            console.error(e);
            callback();
        }
    },
    getContext() {
        if (appContext == null) {
            throw new Error("App Context is not initialized");
        }
        return appContext;
    }
}