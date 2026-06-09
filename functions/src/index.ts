import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

initializeApp();
setGlobalOptions({ maxInstances: 10, region: "europe-west1" });

export { onboarding } from "./onboarding.js";
export { detectDuplicates, mergeGuests } from "./guests.js";
export { selectVendor, updatePayment } from "./tasks.js";
export { onExpenseCreated, onGuestRsvpUpdated } from "./budget.js";
export { addShareGuest, submitShareList } from "./share.js";
export { deleteAllData } from "./deleteAllData.js";
