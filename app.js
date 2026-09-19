// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 1.2
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
    id: "",
    name: "",
    email: "",
    phone: "",
    target: 13,
    sales: 0
  },

  prospects: [],

  products: [],

  ideas: [],

  news: [],

  activities: [],

  appointments: [],

  productIntersections: []

};


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
// SUPABASE CONNECTION CHECK
// ------------------------------------------------------------

async function checkSupabaseConnection() {

  if (!supabaseClient) {

    console.warn(
      "Adviser OS: Supabase client not available."
    );

    AdviserOS.connected = false;

    updateConnectionDisplay();

    return false;
  }

  try {

    const { error } = await supabaseClient
      .from("profiles")
      .select("*")
      .limit(1);

    if (error) {

      console.error(
        "Adviser OS: Supabase test failed:",
        error.message
      );

      AdviserOS.connected = false;

      updateConnectionDisplay();

      return false;
    }

    AdviserOS.connected = true;

    console.log(
      "Adviser OS: Supabase database connected."
    );

    updateConnectionDisplay();

    return true;

  } catch (error) {

    console.error(
      "Adviser OS: Connection test failed.",
      error
    );

    AdviserOS.connected = false;

    updateConnectionDisplay();

    return false;
  }

}


// ------------------------------------------------------------
// LOAD ADVISER
// ------------------------------------------------------------

async function loadAdviser() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("advisers")
        .select("*")
        .limit(1);

    if (error) {

      console.error(
        "Adviser OS: Could not load adviser:",
        error.message
      );

      return;
    }

    if (data && data.length > 0) {

      const adviser = data[0];

      AdviserOS.adviser.id =
        adviser.id || "";

      AdviserOS.adviser.name =
        adviser.full_name || "";

      AdviserOS.adviser.email =
        adviser.email || "";

      AdviserOS.adviser.phone =
        adviser.phone || "";

      AdviserOS.adviser.target =
        Number(adviser.target_sales) || 13;

      console.log(
        "Adviser OS: Adviser loaded:",
        AdviserOS.adviser.name
      );

    }

  } catch (error) {

    console.error(
      "Adviser OS: Adviser loading failed.",
      error
    );

  }

}


// ------------------------------------------------------------
// LOAD PROSPECTS
// ------------------------------------------------------------

async function loadProspects() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("prospects")
        .select("*");

    if (error) {

      console.error(
        "Adviser OS: Could not load prospects:",
        error.message
      );

      AdviserOS.prospects = [];

      return;
    }

    AdviserOS.prospects =
      data || [];

    console.log(
      "Adviser OS: Prospects loaded:",
      AdviserOS.prospects.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Prospect loading failed.",
      error
    );

    AdviserOS.prospects = [];

  }

}


// ------------------------------------------------------------
// LOAD PRODUCTS + PRODUCT INTELLIGENCE
// ------------------------------------------------------------

async function loadProducts() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name");

    if (error) {

      console.error(
        "Adviser OS: Could not load products:",
        error.message
      );

      AdviserOS.products = [];

      return;
    }

    AdviserOS.products =
      data || [];

    console.log(
      "Adviser OS: Products loaded:",
      AdviserOS.products.length
    );


    // --------------------------------------------------------
    // PRODUCT INTELLIGENCE CHECK
    // --------------------------------------------------------

    AdviserOS.products.forEach(product => {

      console.log(
        "Product Intelligence:",
        {
          name: product.name,
          category: product.category,
          provider: product.provider,
          idealClient: product.ideal_client,
          benefits: product.key_benefits,
          discoveryQuestions: product.discovery_questions,
          objections: product.common_objections,
          salesNotes: product.sales_notes
        }
      );

    });


    // Prepare the intersection engine

    buildProductIntersections();

  } catch (error) {

    console.error(
      "Adviser OS: Product loading failed.",
      error
    );

    AdviserOS.products = [];

  }

}


// ------------------------------------------------------------
// PRODUCT INTERSECTION ENGINE
// ------------------------------------------------------------

function buildProductIntersections() {

  AdviserOS.productIntersections = [];

  const products =
    AdviserOS.products;

  if (products.length < 2) {

    console.log(
      "Adviser OS: Not enough products for intersections."
    );

    return;
  }


  for (
    let i = 0;
    i < products.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < products.length;
      j++
    ) {

      const productA =
        products[i];

      const productB =
        products[j];


      AdviserOS.productIntersections.push({

        productA: productA.name,

        productB: productB.name,

        categoryA: productA.category,

        categoryB: productB.category,

        description:
          productA.name +
          " + " +
          productB.name,

        status: "Potential Opportunity"

      });

    }

  }


  console.log(
    "Adviser OS: Product intersections generated:",
    AdviserOS.productIntersections.length
  );

}


// ------------------------------------------------------------
// LOAD ACTIVITIES
// ------------------------------------------------------------

async function loadActivities() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("activities")
        .select("*");

    if (error) {

      console.warn(
        "Adviser OS: Activities could not be loaded:",
        error.message
      );

      AdviserOS.activities = [];

      return;
    }

    AdviserOS.activities =
      data || [];

    console.log(
      "Adviser OS: Activities loaded:",
      AdviserOS.activities.length
    );

  } catch (error) {

    console.warn(
      "Adviser OS: Activity loading failed.",
      error
    );

    AdviserOS.activities = [];

  }

}


// ------------------------------------------------------------
// LOAD APPOINTMENTS
// ------------------------------------------------------------

async function loadAppointments() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("appointments")
        .select("*");

    if (error) {

      console.warn(
        "Adviser OS: Appointments could not be loaded:",
        error.message
      );

      AdviserOS.appointments = [];

      return;
    }

    AdviserOS.appointments =
      data || [];

    console.log(
      "Adviser OS: Appointments loaded:",
      AdviserOS.appointments.length
    );

  } catch (error) {

    console.warn(
      "Adviser OS: Appointment loading failed.",
      error
    );

    AdviserOS.appointments = [];

  }

}


// ------------------------------------------------------------
// LOAD SALES
// ------------------------------------------------------------

async function loadSales() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("sales")
        .select("*");

    if (error) {

      console.warn(
        "Adviser OS: Sales could not be loaded:",
        error.message
      );

      AdviserOS.adviser.sales = 0;

      return;
    }

    const sales =
      data || [];

    AdviserOS.adviser.sales =
      sales.length;

    console.log(
      "Adviser OS: Sales loaded:",
      sales.length
    );

  } catch (error) {

    console.warn(
      "Adviser OS: Sales loading failed.",
      error
    );

    AdviserOS.adviser.sales = 0;

  }

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

    const hotLeads =
      AdviserOS.prospects.filter(
        prospect => {

          return (
            prospect.hot === true ||
            prospect.hot === "true" ||
            prospect.priority === "hot" ||
            prospect.priority === "Hot" ||
            prospect.status === "hot" ||
            prospect.status === "Hot"
          );

        }
      ).length;

    hotLeadElement.textContent =
      hotLeads;

  }

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
// REFRESH ALL DATA
// ------------------------------------------------------------

async function refreshAdviserOSData() {

  console.log(
    "Adviser OS: Refreshing database data..."
  );

  await loadAdviser();

  await loadProspects();

  await loadProducts();

  await loadActivities();

  await loadAppointments();

  await loadSales();

  updateCommandCentre();

  console.log(
    "Adviser OS: Database data refreshed."
  );

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


  const connected =
    await checkSupabaseConnection();


  if (connected) {

    await refreshAdviserOSData();

  }


  updateCommandCentre();

  updateConnectionDisplay();


  console.log(
    "Adviser OS initialisation complete."
  );

}


// ------------------------------------------------------------
// AUTOMATIC REFRESH
// ------------------------------------------------------------

setInterval(
  async function () {

    if (!AdviserOS.connected) {
      return;
    }

    await refreshAdviserOSData();

  },
  60000
);


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

window.AdviserOS =
  AdviserOS;

window.navigateTo =
  navigateTo;

window.newProspect =
  newProspect;

window.clientDiscovery =
  clientDiscovery;

window.productIntelligence =
  productIntelligence;

window.refreshAdviserOSData =
  refreshAdviserOSData;


// ------------------------------------------------------------
// FINAL LOAD MESSAGE
// ------------------------------------------------------------

console.log(
  "Adviser OS app.js loaded successfully."
);


// ------------------------------------------------------------
// CONNECTION STATUS SAFETY CHECK
// ------------------------------------------------------------

setTimeout(
  function () {

    const status =
      document.getElementById(
        "connection-status"
      );

    if (status) {

      status.textContent =
        AdviserOS.connected
          ? "● Supabase Connected"
          : "● Supabase NOT Connected";

    }

  },
  3000
);
