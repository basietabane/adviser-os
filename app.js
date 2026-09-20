// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 2.0
// ============================================================

console.log("Adviser OS app.js loading...");

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


// ============================================================
// CENTRAL APPLICATION STATE
// ============================================================

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

  appointments: [],

  opportunities: []
};


// ============================================================
// CONNECTION STATUS
// ============================================================

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


// ============================================================
// SUPABASE CONNECTION
// ============================================================

async function checkSupabaseConnection() {

  if (!supabaseClient) {

    AdviserOS.connected = false;

    updateConnectionDisplay();

    return false;
  }

  try {

    const { data, error } =
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


// ============================================================
// LOAD ADVISER
// ============================================================

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


// ============================================================
// LOAD PROSPECTS
// ============================================================

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

    AdviserOS.prospects = [];
  }
}


// ============================================================
// LOAD PRODUCTS
// ============================================================

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


// ============================================================
// LOAD PRODUCT INTERSECTIONS
// ============================================================

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
      "Product intersections loaded:",
      AdviserOS.productIntersections.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Product intersection loading failed.",
      error
    );

    AdviserOS.productIntersections = [];
  }
}


// ============================================================
// LOAD ACTIVITIES
// ============================================================

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


// ============================================================
// LOAD APPOINTMENTS
// ============================================================

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


// ============================================================
// LOAD SALES
// ============================================================

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


// ============================================================
// COMMAND CENTRE
// ============================================================

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
            prospect.priority === "HIGH" ||
            prospect.priority === "High" ||
            prospect.status === "hot" ||
            prospect.status === "Hot"
          );
        }
      ).length;

    hotLeadElement.textContent =
      hotLeads;
  }
}


// ============================================================
// PRODUCT HELPERS
// ============================================================

function getProductByName(name) {

  if (!name) return null;

  return AdviserOS.products.find(
    product =>
      product.name.toLowerCase() ===
      name.toLowerCase()
  ) || null;
}


function getProductIntersections(productName) {

  if (!productName) return [];

  return AdviserOS.productIntersections.filter(
    intersection => {

      return (
        intersection.productAName ===
          productName ||

        intersection.productBName ===
          productName
      );
    }
  );
}


// ============================================================
// OPPORTUNITY ANALYSIS
// ============================================================

function analyseProspectOpportunity(prospect) {

  if (!prospect) {
    return null;
  }


  const productInterest =
    (
      prospect.product_interest ||
      ""
    ).trim();


  let primaryProduct = null;


  if (productInterest) {

    primaryProduct =
      AdviserOS.products.find(
        product => {

          return (
            product.name.toLowerCase() ===
            productInterest.toLowerCase()
          );
        }
      );
  }


  const opportunities = [];


  if (primaryProduct) {

    const intersections =
      getProductIntersections(
        primaryProduct.name
      );


    intersections.forEach(
      intersection => {

        const complementaryProduct =
          intersection.productAName ===
            primaryProduct.name

            ? intersection.productBName

            : intersection.productAName;


        const product =
          getProductByName(
            complementaryProduct
          );


        if (product) {

          opportunities.push({

            product:
              product.name,

            category:
              product.category,

            relationship:
              intersection.relationship_type,

            explanation:
              intersection.explanation
          });
        }
      }
    );
  }


  return {

    prospectId:
      prospect.id || "",

    prospectName:
      prospect.full_name ||
      "Unnamed Prospect",

    organisation:
      prospect.organisation ||
      "",

    segment:
      prospect.segment ||
      "",

    location:
      prospect.location ||
      "",

    stage:
      prospect.stage ||
      "",

    priority:
      prospect.priority ||
      "",

    productInterest:
      productInterest,

    estimatedPremium:
      Number(
        prospect.estimated_premium
      ) || 0,

    notes:
      prospect.notes ||
      "",

    nextAction:
      prospect.next_action ||
      "",

    followUpDate:
      prospect.follow_up_date ||
      "",

    primaryProduct:
      primaryProduct
        ? primaryProduct.name
        : productInterest,

    opportunities:
      opportunities
  };
}


// ============================================================
// RUN OPPORTUNITY ENGINE
// ============================================================

function runOpportunityEngine() {

  if (!AdviserOS.prospects.length) {

    AdviserOS.opportunities = [];

    return [];
  }


  const results =
    AdviserOS.prospects.map(
      analyseProspectOpportunity
    );


  const opportunities =
    results.filter(
      result => {

        return (
          result &&
          result.opportunities &&
          result.opportunities.length > 0
        );
      }
    );


  AdviserOS.opportunities =
    opportunities;


  console.log(
    "Opportunity Engine:",
    opportunities.length,
    "prospects with opportunities."
  );


  return opportunities;
}


// ============================================================
// OPPORTUNITY SUMMARY
// ============================================================

function getOpportunitySummary() {

  const opportunities =
    runOpportunityEngine();


  const totalOpportunities =
    opportunities.reduce(
      (total, prospect) => {

        return (
          total +
          prospect.opportunities.length
        );
      },
      0
    );


  const highPriority =
    opportunities.filter(
      prospect => {

        const priority =
          (
            prospect.priority ||
            ""
          ).toLowerCase();

        return (
          priority === "high" ||
          priority === "hot"
        );
      }
    ).length;


  return {

    prospects:
      opportunities.length,

    opportunities:
      totalOpportunities,

    highPriority:
      highPriority
  };
}


// ============================================================
// INDIVIDUAL PROSPECT OPPORTUNITIES
// ============================================================

function getProspectOpportunities(
  prospectId
) {

  const prospect =
    AdviserOS.prospects.find(
      item =>
        item.id === prospectId
    );


  if (!prospect) {
    return null;
  }


  return analyseProspectOpportunity(
    prospect
  );
}


// ============================================================
// GENERATE SUGGESTED NEXT MOVE
// ============================================================

function generateNextMove(opportunity) {

  if (!opportunity) {

    return "Begin a discovery conversation.";
  }


  if (opportunity.nextAction) {

    return opportunity.nextAction;
  }


  const stage =
    (
      opportunity.stage ||
      ""
    ).toLowerCase();


  if (
    stage.includes("new") ||
    stage.includes("lead")
  ) {

    return (
      "Start with discovery questions " +
      "before presenting the product."
    );
  }


  if (
    stage.includes("quote") ||
    stage.includes("proposal")
  ) {

    return (
      "Follow up on the proposal and " +
      "address any outstanding questions."
    );
  }


  if (
    stage.includes("follow")
  ) {

    return (
      "Follow up and identify whether " +
      "another protection or planning need exists."
    );
  }


  return (
    "Explore the primary need, then " +
    "introduce the complementary opportunity."
  );
}


// ============================================================
// OPPORTUNITY CENTRE
// ============================================================

function createOpportunityCentre() {

  let centre =
    document.getElementById(
      "adviser-os-opportunity-centre"
    );


  if (!centre) {

    centre =
      document.createElement("section");

    centre.id =
      "adviser-os-opportunity-centre";


    const firstScreen =
      document.querySelector(".screen");


    if (firstScreen) {

      firstScreen.parentNode.insertBefore(
        centre,
        firstScreen
      );

    } else {

      document.body.prepend(
        centre
      );
    }
  }


  const opportunities =
    runOpportunityEngine();


  const summary =
    getOpportunitySummary();


  centre.innerHTML = "";


  // ========================================================
  // CENTRE STYLING
  // ========================================================

  centre.style.cssText = `
    width: calc(100% - 32px);
    max-width: 1200px;
    margin: 20px auto;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  `;


  const panel =
    document.createElement("div");


  panel.style.cssText = `
    background: #ffffff;
    border: 1px solid #dfe5ec;
    border-radius: 16px;
    padding: 22px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  `;


  // ========================================================
  // HEADER
  // ========================================================

  const header =
    document.createElement("div");


  header.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    flex-wrap:wrap;
    margin-bottom:20px;
  `;


  const title =
    document.createElement("div");


  title.innerHTML = `
    <div style="
      font-size:12px;
      font-weight:bold;
      letter-spacing:1px;
      color:#667085;
      text-transform:uppercase;
      margin-bottom:5px;
    ">
      Adviser Intelligence
    </div>

    <div style="
      font-size:26px;
      font-weight:700;
      color:#172033;
    ">
      Opportunity Centre
    </div>

    <div style="
      font-size:14px;
      color:#667085;
      margin-top:5px;
    ">
      Turn prospect information into the next useful conversation.
    </div>
  `;


  header.appendChild(title);


  const refreshButton =
    document.createElement("button");


  refreshButton.textContent =
    "Refresh Opportunities";


  refreshButton.style.cssText = `
    border:none;
    border-radius:10px;
    padding:11px 16px;
    background:#172033;
    color:#ffffff;
    font-weight:600;
    cursor:pointer;
  `;


  refreshButton.onclick =
    async function () {

      refreshButton.textContent =
        "Refreshing...";

      await refreshAdviserOSData();

      createOpportunityCentre();
    };


  header.appendChild(
    refreshButton
  );


  panel.appendChild(header);


  // ========================================================
  // SUMMARY CARDS
  // ========================================================

  const summaryGrid =
    document.createElement("div");


  summaryGrid.style.cssText = `
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(150px,1fr));
    gap:12px;
    margin-bottom:22px;
  `;


  const summaryCards = [

    {
      label:"Prospects with Opportunities",
      value:summary.prospects
    },

    {
      label:"Product Connections",
      value:summary.opportunities
    },

    {
      label:"High Priority",
      value:summary.highPriority
    },

    {
      label:"Products Loaded",
      value:AdviserOS.products.length
    }

  ];


  summaryCards.forEach(card => {

    const item =
      document.createElement("div");


    item.style.cssText = `
      background:#f7f9fc;
      border:1px solid #e5e9ef;
      border-radius:12px;
      padding:15px;
    `;


    item.innerHTML = `

      <div style="
        font-size:12px;
        color:#667085;
        margin-bottom:7px;
      ">
        ${escapeHtml(card.label)}
      </div>

      <div style="
        font-size:25px;
        font-weight:700;
        color:#172033;
      ">
        ${card.value}
      </div>

    `;


    summaryGrid.appendChild(item);
  });


  panel.appendChild(
    summaryGrid
  );


  // ========================================================
  // NO OPPORTUNITIES
  // ========================================================

  if (!opportunities.length) {

    const empty =
      document.createElement("div");


    empty.style.cssText = `
      padding:25px;
      text-align:center;
      border:1px dashed #cbd5e1;
      border-radius:12px;
      color:#667085;
      background:#fafbfc;
    `;


    empty.innerHTML = `

      <div style="
        font-size:18px;
        font-weight:700;
        color:#344054;
        margin-bottom:7px;
      ">
        Opportunity Engine is ready
      </div>

      <div>
        Add a product interest to prospects
        and the engine will identify
        complementary opportunities.
      </div>

    `;


    panel.appendChild(
      empty
    );

  } else {

    // ======================================================
    // OPPORTUNITY LIST
    // ======================================================

    const list =
      document.createElement("div");


    list.style.cssText = `
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:15px;
    `;


    opportunities.forEach(
      opportunity => {

        const card =
          document.createElement("div");


        const priority =
          (
            opportunity.priority ||
            ""
          ).toLowerCase();


        const isHigh =
          priority === "high" ||
          priority === "hot";


        card.style.cssText = `
          border:1px solid #e1e7ef;
          border-radius:14px;
          padding:18px;
          background:#ffffff;
        `;


        let opportunityHtml = "";


        opportunity.opportunities.forEach(
          item => {

            opportunityHtml += `

              <div style="
                margin-top:12px;
                padding:12px;
                background:#f7f9fc;
                border-radius:10px;
              ">

                <div style="
                  font-size:12px;
                  color:#667085;
                  margin-bottom:4px;
                ">
                  COMPLEMENTARY OPPORTUNITY
                </div>

                <div style="
                  font-size:17px;
                  font-weight:700;
                  color:#172033;
                ">
                  ${escapeHtml(item.product)}
                </div>

                <div style="
                  font-size:13px;
                  color:#667085;
                  margin-top:5px;
                ">
                  ${escapeHtml(
                    item.explanation ||
                    "Complementary product opportunity."
                  )}
                </div>

              </div>

            `;
          }
        );


        card.innerHTML = `

          <div style="
            display:flex;
            justify-content:space-between;
            gap:10px;
            align-items:flex-start;
          ">

            <div>

              <div style="
                font-size:18px;
                font-weight:700;
                color:#172033;
              ">
                ${escapeHtml(
                  opportunity.prospectName
                )}
              </div>

              <div style="
                font-size:13px;
                color:#667085;
                margin-top:3px;
              ">
                ${escapeHtml(
                  opportunity.organisation ||
                  opportunity.segment ||
                  "Prospect"
                )}
              </div>

            </div>

            ${
              isHigh
                ? `
                  <span style="
                    background:#fff4e5;
                    color:#9a6700;
                    padding:5px 8px;
                    border-radius:7px;
                    font-size:11px;
                    font-weight:700;
                  ">
                    HIGH PRIORITY
                  </span>
                `
                : ""
            }

          </div>


          <div style="
            margin-top:15px;
            padding:12px;
            border-radius:10px;
            background:#f4f7fb;
          ">

            <div style="
              font-size:11px;
              color:#667085;
              text-transform:uppercase;
              letter-spacing:.5px;
            ">
              Current Product Interest
            </div>

            <div style="
              margin-top:4px;
              font-size:16px;
              font-weight:700;
              color:#172033;
            ">
              ${escapeHtml(
                opportunity.primaryProduct ||
                opportunity.productInterest ||
                "Not specified"
              )}
            </div>

          </div>


          ${
            opportunity.estimatedPremium > 0
              ? `
                <div style="
                  margin-top:12px;
                  font-size:13px;
                  color:#475467;
                ">
                  Estimated premium:
                  <strong>
                    R${Number(
                      opportunity.estimatedPremium
                    ).toLocaleString(
                      "en-ZA",
                      {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                      }
                    )}
                  </strong>
                </div>
              `
              : ""
          }


          ${opportunityHtml}


          <div style="
            margin-top:14px;
            padding-top:13px;
            border-top:1px solid #eaecf0;
          ">

            <div style="
              font-size:11px;
              color:#667085;
              text-transform:uppercase;
              letter-spacing:.5px;
            ">
              Suggested Next Move
            </div>

            <div style="
              font-size:13px;
              line-height:1.5;
              color:#344054;
              margin-top:5px;
            ">
              ${escapeHtml(
                generateNextMove(
                  opportunity
                )
              )}
            </div>

          </div>

        `;


        list.appendChild(card);
      }
    );


    panel.appendChild(
      list
    );
  }


  centre.appendChild(
    panel
  );


  console.log(
    "Opportunity Centre rendered."
  );
}


// ============================================================
// HTML SAFETY HELPER
// ============================================================

function escapeHtml(value) {

  if (value === null ||
      value === undefined) {

    return "";
  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


// ============================================================
// SCREEN NAVIGATION
// ============================================================

function navigateTo(screenId) {

  const screen =
    document.getElementById(
      screenId
    );


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

      item.classList.remove(
        "active"
      );
    });


  screen.classList.add(
    "active"
  );


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


function newProspect() {

  navigateTo(
    "prospects"
  );
}


function clientDiscovery() {

  navigateTo(
    "client-workspace"
  );
}


function productIntelligence() {

  navigateTo(
    "product-intelligence"
  );
}


// ============================================================
// REFRESH ALL DATA
// ============================================================

async function refreshAdviserOSData() {

  console.log(
    "Adviser OS: Refreshing database data..."
  );


  await loadAdviser();

  await loadProspects();

  await loadProducts();

  await loadProductIntersections();

  await loadActivities();

  await loadAppointments();

  await loadSales();


  runOpportunityEngine();

  updateCommandCentre();


  console.log(
    "Adviser OS: Database refresh complete."
  );
}


// ============================================================
// INITIALISE
// ============================================================

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


  // Give the existing page a moment
  // to finish rendering before adding
  // the Opportunity Centre.

  setTimeout(
    function () {

      createOpportunityCentre();

    },
    500
  );


  console.log(
    "Adviser OS initialisation complete."
  );
}


// ============================================================
// AUTOMATIC REFRESH
// ============================================================

setInterval(
  async function () {

    if (!AdviserOS.connected) {
      return;
    }


    await refreshAdviserOSData();


    createOpportunityCentre();

  },
  60000
);


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initialiseAdviserOS();

  }
);


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

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

window.analyseProspectOpportunity =
  analyseProspectOpportunity;

window.runOpportunityEngine =
  runOpportunityEngine;

window.getProspectOpportunities =
  getProspectOpportunities;

window.getOpportunitySummary =
  getOpportunitySummary;

window.createOpportunityCentre =
  createOpportunityCentre;


console.log(
  "Adviser OS app.js loaded successfully."
);


// ============================================================
// CONNECTION STATUS FINAL CHECK
// ============================================================

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
