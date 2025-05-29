import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase.config.js"; 

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
