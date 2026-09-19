// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 1.0
// ============================================================

console.log("Adviser OS app.js loading...");

// ------------------------------------------------------------
// SUPABASE CONNECTION
// ------------------------------------------------------------

let supabaseClient = null;

try {

  if (
    window.supabase &&
    window.SUPABASE_URL &&
    window.SUPABASE_PUBLISHABLE_KEY
  ) {

    supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    console.log("Adviser OS: Supabase connected.");

  } else {

    console.warn(
      "Adviser OS: Supabase configuration not found."
    );

  }

} catch (error) {

  console.error(
    "Adviser OS: Supabase connection failed.",
    error
  );

}


// ------------------------------------------------------------
// APPLICATION STATE
// ------------------------------------------------------------

const AdviserOS = {

  connected: false,

  adviser: {
    name: "",
    target: 13,
    sales: 1
  },

  prospects: [],

  products: [],

  ideas: [],

  news: []

};


// ------------------------------------------------------------
// CONNECTION CHECK
// ------------------------------------------------------------

async function checkSupabaseConnection() {

  if (!supabaseClient) {

    console.warn(
      "Adviser OS: No Supabase client available."
    );

    return false;
  }

  try {

    const { data, error } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .limit(1);

    if (error) {

      console.warn(
        "Adviser OS: Supabase responded, but the profiles table could not be read.",
        error.message
      );

      AdviserOS.connected = false;

      return false;
    }

    AdviserOS.connected = true;

    console.log(
      "Adviser OS: Supabase database is reachable."
    );

    updateConnectionDisplay();

    return true;

  } catch (error) {

    console.error(
      "Adviser OS: Connection test failed.",
      error
    );

    AdviserOS.connected = false;

    return false;
  }
}


// ------------------------------------------------------------
// CONNECTION DISPLAY
// ------------------------------------------------------------

function updateConnectionDisplay() {

  const statusElements =
    document.querySelectorAll(
      ".connection-status, #connection-status, [data-connection-status]"
    );

  statusElements.forEach(element => {

    if (AdviserOS.connected) {

      element.textContent =
        "● Supabase Connected";

    } else {

      element.textContent =
        "● Prototype Online";

    }

  });

}


// ------------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------------

function navigateTo(screenId) {

  const screen =
    document.getElementById(screenId);

  if (!screen) {

    console.warn(
      "Adviser OS: Screen not found:",
      screenId
    );

    return;
  }

  document
    .querySelectorAll(".screen")
    .forEach(item => {

      item.classList.remove("active");

    });

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ------------------------------------------------------------
// QUICK ACTIONS
// ------------------------------------------------------------

function newProspect() {

  navigateTo("prospects");

}


function clientDiscovery() {

  navigateTo("client-workspace");

}


function productIntelligence() {

  navigateTo("product-intelligence");

}


// ------------------------------------------------------------
// COMMAND CENTRE
// ------------------------------------------------------------

function updateCommandCentre() {

  const targetElement =
    document.querySelector(
      "[data-cycle-target]"
    );

  const salesElement =
    document.querySelector(
      "[data-sales]"
    );

  const prospectElement =
    document.querySelector(
      "[data-active-prospects]"
    );

  const hotLeadElement =
    document.querySelector(
      "[data-hot-leads]"
    );


  if (targetElement) {

    targetElement.textContent =
      AdviserOS.adviser.target;

  }


  if (salesElement) {

    salesElement.textContent =
      AdviserOS.adviser.sales;

  }


  if (prospectElement) {

    prospectElement.textContent =
      AdviserOS.prospects.length;

  }


  if (hotLeadElement) {

    hotLeadElement.textContent =
      AdviserOS.prospects.filter(
        prospect => prospect.hot === true
      ).length;

  }

}


// ------------------------------------------------------------
// INITIALISE APPLICATION
// ------------------------------------------------------------

async function initialiseAdviserOS() {

  console.log(
    "Adviser OS initialising..."
  );

  updateCommandCentre();

  updateConnectionDisplay();

  await checkSupabaseConnection();

  console.log(
    "Adviser OS initialisation complete."
  );

}


// ------------------------------------------------------------
// START APPLICATION
// ------------------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initialiseAdviserOS();

  }
);


// ------------------------------------------------------------
// GLOBAL ACCESS
// ------------------------------------------------------------

window.AdviserOS = AdviserOS;

window.navigateTo = navigateTo;

window.newProspect = newProspect;

window.clientDiscovery = clientDiscovery;

window.productIntelligence = productIntelligence;

console.log(
  "Adviser OS app.js loaded successfully."
);
