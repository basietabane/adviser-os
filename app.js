// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 1.3
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

  productIntersections: [],

  ideas: [],

  news: [],

  activities: [],

  appointments: []

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

    element.textContent =
      AdviserOS.connected
        ? "● Supabase Connected"
        : "● Prototype Online";

  });

}


// ------------------------------------------------------------
// SUPABASE CONNECTION CHECK
// ------------------------------------------------------------

async function checkSupabaseConnection() {

  if (!supabaseClient) {

    AdviserOS.connected = false;

    updateConnectionDisplay();

    return false;

  }

  try {

    const { error } =
      await supabaseClient
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

    updateConnectionDisplay();

    console.log(
      "Adviser OS: Supabase database connected."
    );

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
        "Adviser OS: Adviser loading failed:",
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
        "Adviser loaded:",
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
        "Adviser OS: Prospect loading failed:",
        error.message
      );

      AdviserOS.prospects = [];

      return;

    }

    AdviserOS.prospects =
      data || [];

    console.log(
      "Prospects loaded:",
      AdviserOS.prospects.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Prospect loading failed.",
      error
    );

  }

}


// ------------------------------------------------------------
// LOAD PRODUCTS
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
        "Adviser OS: Product loading failed:",
        error.message
      );

      AdviserOS.products = [];

      return;

    }

    AdviserOS.products =
      data || [];

    console.log(
      "Products loaded:",
      AdviserOS.products.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Product loading failed.",
      error
    );

    AdviserOS.products = [];

  }

}


// ------------------------------------------------------------
// LOAD PRODUCT INTERSECTIONS
// ------------------------------------------------------------

async function loadProductIntersections() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("product_intersections")
        .select("*")
        .eq("active", true);

    if (error) {

      console.error(
        "Adviser OS: Product intersection loading failed:",
        error.message
      );

      AdviserOS.productIntersections = [];

      return;

    }

    AdviserOS.productIntersections =
      data || [];

    console.log(
      "Product intersections loaded:",
      AdviserOS.productIntersections.length
    );


    // --------------------------------------------------------
    // CONNECT PRODUCT NAMES TO INTERSECTIONS
    // --------------------------------------------------------

    AdviserOS.productIntersections =
      AdviserOS.productIntersections.map(
        intersection => {

          const productA =
            AdviserOS.products.find(
              product =>
                product.id ===
                intersection.product_a_id
            );

          const productB =
            AdviserOS.products.find(
              product =>
                product.id ===
                intersection.product_b_id
            );

          return {

            ...intersection,

            productAName:
              productA
                ? productA.name
                : "Unknown Product",

            productBName:
              productB
                ? productB.name
                : "Unknown Product"

          };

        }
      );


    console.log(
      "Adviser OS: Product intersections linked to products."
    );


    AdviserOS.productIntersections.forEach(
      intersection => {

        console.log(
          "Intersection:",
          intersection.productAName,
          "+",
          intersection.productBName,
          "|",
          intersection.relationship_type
        );

      }
    );

  } catch (error) {

    console.error(
      "Adviser OS: Product intersection loading failed.",
      error
    );

    AdviserOS.productIntersections = [];

  }

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
        "Activities could not be loaded:",
        error.message
      );

      AdviserOS.activities = [];

      return;

    }

    AdviserOS.activities =
      data || [];

  } catch (error) {

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
        "Appointments could not be loaded:",
        error.message
      );

      AdviserOS.appointments = [];

      return;

    }

    AdviserOS.appointments =
      data || [];

  } catch (error) {

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
        "Sales could not be loaded:",
        error.message
      );

      return;

    }

    AdviserOS.adviser.sales =
      (data || []).length;

  } catch (error) {

    console.warn(
      "Sales loading failed.",
      error
    );

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
// PRODUCT INTELLIGENCE HELPER
// ------------------------------------------------------------

function getProductByName(name) {

  return AdviserOS.products.find(
    product =>
      product.name.toLowerCase() ===
      name.toLowerCase()
  ) || null;

}


// ------------------------------------------------------------
// FIND PRODUCT INTERSECTIONS
// ------------------------------------------------------------

function getProductIntersections(productName) {

  return AdviserOS.productIntersections.filter(
    intersection => {

      return (
        intersection.productAName === productName ||
        intersection.productBName === productName
      );

    }
  );

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

  // Important:
  // Products must load BEFORE intersections
  // because intersections use product IDs.

  await loadProductIntersections();

  await loadActivities();

  await loadAppointments();

  await loadSales();

  updateCommandCentre();

  console.log(
    "Adviser OS: Database refresh complete."
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

window.getProductByName =
  getProductByName;

window.getProductIntersections =
  getProductIntersections;


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
// ============================================================
// ADVISER OS — OPPORTUNITY ENGINE
// Version 1.0
// ============================================================

function analyseProspectOpportunity(prospect) {
  if (!prospect) {
    return null;
  }

  const productInterest =
    (prospect.product_interest || "").trim();

  let primaryProduct = null;

  if (productInterest) {
    primaryProduct = AdviserOS.products.find(product => {
      return (
        product.name.toLowerCase() ===
        productInterest.toLowerCase()
      );
    });
  }

  const opportunities = [];

  if (primaryProduct) {
    const intersections =
      getProductIntersections(primaryProduct.name);

    intersections.forEach(intersection => {
      const complementaryProduct =
        intersection.productAName === primaryProduct.name
          ? intersection.productBName
          : intersection.productAName;

      const product =
        getProductByName(complementaryProduct);

      if (product) {
        opportunities.push({
          product: product.name,
          category: product.category,
          relationship:
            intersection.relationship_type,
          explanation:
            intersection.explanation
        });
      }
    });
  }

  return {
    prospectId: prospect.id || "",
    prospectName: prospect.full_name || "Unnamed Prospect",
    organisation: prospect.organisation || "",
    segment: prospect.segment || "",
    location: prospect.location || "",
    stage: prospect.stage || "",
    priority: prospect.priority || "",
    primaryProduct:
      primaryProduct ? primaryProduct.name : productInterest,
    opportunities: opportunities
  };
}


function runOpportunityEngine() {
  console.log(
    "=========================================="
  );

  console.log(
    "ADVISER OS — OPPORTUNITY ENGINE"
  );

  console.log(
    "=========================================="
  );

  if (!AdviserOS.prospects.length) {
    console.log(
      "No prospects available for analysis."
    );
    return [];
  }

  const results =
    AdviserOS.prospects.map(
      analyseProspectOpportunity
    );

  const opportunities =
    results.filter(result => {
      return (
        result &&
        result.opportunities &&
        result.opportunities.length > 0
      );
    });

  console.log(
    "Prospects analysed:",
    results.length
  );

  console.log(
    "Opportunities found:",
    opportunities.length
  );

  opportunities.forEach(result => {
    console.log(
      "------------------------------------------"
    );

    console.log(
      "Prospect:",
      result.prospectName
    );

    console.log(
      "Primary product:",
      result.primaryProduct
    );

    result.opportunities.forEach(
      opportunity => {
        console.log(
          "Opportunity:",
          result.primaryProduct,
          "+",
          opportunity.product
        );

        console.log(
          "Relationship:",
          opportunity.relationship
        );

        console.log(
          "Reason:",
          opportunity.explanation
        );
      }
    );
  });

  return opportunities;
}


function getProspectOpportunities(prospectId) {
  const prospect =
    AdviserOS.prospects.find(
      item => item.id === prospectId
    );

  if (!prospect) {
    return null;
  }

  return analyseProspectOpportunity(prospect);
}


// Make Opportunity Engine available to the browser.
window.analyseProspectOpportunity =
  analyseProspectOpportunity;

window.runOpportunityEngine =
  runOpportunityEngine;

window.getProspectOpportunities =
  getProspectOpportunities;

console.log(
  "Adviser OS: Opportunity Engine loaded."
);
// ============================================================
// ADVISER OS — OPPORTUNITY ENGINE
// Version 1.0
// ============================================================

function analyseProspectOpportunity(prospect) {
  if (!prospect) {
    return null;
  }

  const productInterest =
    (prospect.product_interest || "").trim();

  let primaryProduct = null;

  if (productInterest) {
    primaryProduct = AdviserOS.products.find(product => {
      return (
        product.name.toLowerCase() ===
        productInterest.toLowerCase()
      );
    });
  }

  const opportunities = [];

  if (primaryProduct) {
    const intersections =
      getProductIntersections(primaryProduct.name);

    intersections.forEach(intersection => {
      const complementaryProduct =
        intersection.productAName === primaryProduct.name
          ? intersection.productBName
          : intersection.productAName;

      const product =
        getProductByName(complementaryProduct);

      if (product) {
        opportunities.push({
          product: product.name,
          category: product.category,
          relationship:
            intersection.relationship_type,
          explanation:
            intersection.explanation
        });
      }
    });
  }

  return {
    prospectId: prospect.id || "",
    prospectName:
      prospect.full_name || "Unnamed Prospect",

    organisation:
      prospect.organisation || "",

    segment:
      prospect.segment || "",

    location:
      prospect.location || "",

    stage:
      prospect.stage || "",

    priority:
      prospect.priority || "",

    estimatedPremium:
      Number(prospect.estimated_premium) || 0,

    primaryProduct:
      primaryProduct
        ? primaryProduct.name
        : productInterest,

    opportunities:
      opportunities
  };
}


function runOpportunityEngine() {
  console.log(
    "=========================================="
  );

  console.log(
    "ADVISER OS — OPPORTUNITY ENGINE"
  );

  console.log(
    "=========================================="
  );

  if (!AdviserOS.prospects.length) {
    console.log(
      "No prospects available for analysis."
    );

    return [];
  }

  const results =
    AdviserOS.prospects.map(
      analyseProspectOpportunity
    );

  const opportunities =
    results.filter(result => {
      return (
        result &&
        result.opportunities &&
        result.opportunities.length > 0
      );
    });

  console.log(
    "Prospects analysed:",
    results.length
  );

  console.log(
    "Opportunities found:",
    opportunities.length
  );

  opportunities.forEach(result => {
    console.log(
      "------------------------------------------"
    );

    console.log(
      "Prospect:",
      result.prospectName
    );

    console.log(
      "Primary product:",
      result.primaryProduct
    );

    result.opportunities.forEach(
      opportunity => {
        console.log(
          "Opportunity:",
          result.primaryProduct,
          "+",
          opportunity.product
        );

        console.log(
          "Relationship:",
          opportunity.relationship
        );

        console.log(
          "Reason:",
          opportunity.explanation
        );
      }
    );
  });

  return opportunities;
}


function getProspectOpportunities(prospectId) {
  const prospect =
    AdviserOS.prospects.find(
      item => item.id === prospectId
    );

  if (!prospect) {
    return null;
  }

  return analyseProspectOpportunity(prospect);
}


// ============================================================
// OPPORTUNITY CENTRE DATA
// ============================================================

function getOpportunitySummary() {
  const opportunities =
    runOpportunityEngine();

  const totalOpportunities =
    opportunities.reduce(
      (total, prospect) =>
        total + prospect.opportunities.length,
      0
    );

  const highPriority =
    opportunities.filter(prospect => {
      const priority =
        (prospect.priority || "").toLowerCase();

      return (
        priority === "high" ||
        priority === "hot"
      );
    }).length;

  return {
    prospects: opportunities.length,
    opportunities: totalOpportunities,
    highPriority: highPriority
  };
}


// Make Opportunity Engine available globally.

window.analyseProspectOpportunity =
  analyseProspectOpportunity;

window.runOpportunityEngine =
  runOpportunityEngine;

window.getProspectOpportunities =
  getProspectOpportunities;

window.getOpportunitySummary =
  getOpportunitySummary;

console.log(
  "Adviser OS: Opportunity Engine loaded."
);
