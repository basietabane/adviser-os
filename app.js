// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 4.0
// Live Prospecting Radar + News + Opportunity Centre
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
    console.warn("Adviser OS: Supabase configuration not found.");
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

  prospectingSignals: [],

  territorySignals: [],

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
        .from("news")
        .select("id")
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
      (data || []).map(intersection => {

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
      });

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
// LOAD NEWS
// ============================================================

async function loadNews() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("news")
        .select(`
          id,
          headline,
          source,
          url,
          category,
          summary,
          why_it_matters,
          published_at,
          created_at,
          relevance,
          product_connection,
          active
        `)
        .eq("active", true)
        .order("published_at", {
          ascending: false,
          nullsFirst: false
        })
        .limit(20);

    if (error) {

      console.error(
        "Adviser OS: News loading failed:",
        error.message
      );

      AdviserOS.news = [];

      return;
    }

    AdviserOS.news =
      data || [];

    console.log(
      "News loaded:",
      AdviserOS.news.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: News loading failed.",
      error
    );

    AdviserOS.news = [];
  }
}


// ============================================================
// LOAD PROSPECTING SIGNALS
// ============================================================

async function loadProspectingSignals() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("prospecting_signals")
        .select(`
          id,
          title,
          signal_type,
          location,
          segment,
          source,
          source_url,
          detected_at,
          event_date,
          estimated_start_date,
          estimated_financial_window,
          summary,
          evidence,
          inference,
          potential_needs,
          product_connection,
          action,
          confidence,
          status,
          active,
          next_review_at
        `)
        .eq("active", true)
        .order("detected_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Adviser OS: Prospecting signals loading failed:",
        error.message
      );

      AdviserOS.prospectingSignals = [];

      return;
    }

    AdviserOS.prospectingSignals =
      data || [];

    console.log(
      "Prospecting signals loaded:",
      AdviserOS.prospectingSignals.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Prospecting signals loading failed.",
      error
    );

    AdviserOS.prospectingSignals = [];
  }
}


// ============================================================
// LOAD TERRITORY SIGNALS
// ============================================================

async function loadTerritorySignals() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("territory_signals")
        .select(`
          id,
          territory,
          industry,
          signal_type,
          title,
          summary,
          evidence,
          inference,
          affected_segment,
          potential_needs,
          product_connection,
          timing,
          confidence,
          source,
          source_url,
          detected_at,
          active,
          next_review_at
        `)
        .eq("active", true)
        .order("detected_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Adviser OS: Territory signals loading failed:",
        error.message
      );

      AdviserOS.territorySignals = [];

      return;
    }

    AdviserOS.territorySignals =
      data || [];

    console.log(
      "Territory signals loaded:",
      AdviserOS.territorySignals.length
    );

  } catch (error) {

    console.error(
      "Adviser OS: Territory signals loading failed.",
      error
    );

    AdviserOS.territorySignals = [];
  }
}


// ============================================================
// COMMAND CENTRE
// ============================================================

function updateCommandCentre() {

  const targetElement =
    document.querySelector("[data-cycle-target]");

  const salesElement =
    document.querySelector("[data-sales]");

  const prospectElement =
    document.querySelector("[data-active-prospects]");

  const hotLeadElement =
    document.querySelector("[data-hot-leads]");


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
      String(product.name || "").toLowerCase() ===
      String(name).toLowerCase()
  ) || null;
}


function getProductIntersections(productName) {

  if (!productName) return [];

  return AdviserOS.productIntersections.filter(
    intersection => {

      return (
        intersection.productAName === productName ||
        intersection.productBName === productName
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
    (prospect.product_interest || "").trim();

  let primaryProduct = null;

  if (productInterest) {

    primaryProduct =
      AdviserOS.products.find(
        product =>
          String(product.name || "").toLowerCase() ===
          productInterest.toLowerCase()
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
      result =>
        result &&
        result.opportunities &&
        result.opportunities.length > 0
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
      (total, prospect) =>
        total + prospect.opportunities.length,
      0
    );

  const highPriority =
    opportunities.filter(
      prospect => {

        const priority =
          String(
            prospect.priority || ""
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

function getProspectOpportunities(prospectId) {

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
    String(
      opportunity.stage || ""
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
// NEWS HELPERS
// ============================================================

function formatNewsDate(dateValue) {

  if (!dateValue) {
    return "Date unavailable";
  }

  try {

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

  } catch (error) {

    return "Date unavailable";
  }
}


function getNewsRelevanceClass(relevance) {

  const value =
    String(relevance || "")
      .toLowerCase();

  if (
    value.includes("high") ||
    value.includes("critical") ||
    value.includes("strong")
  ) {
    return "high";
  }

  if (
    value.includes("medium") ||
    value.includes("moderate")
  ) {
    return "medium";
  }

  return "normal";
}


function getNewsRelevanceLabel(relevance) {

  if (!relevance) {
    return "Industry relevance";
  }

  return String(relevance);
}


// ============================================================
// NEWS INTELLIGENCE CENTRE
// ============================================================

function createNewsIntelligence() {

  let centre =
    document.getElementById(
      "adviser-os-news-intelligence"
    );

  if (!centre) {

    centre =
      document.createElement("section");

    centre.id =
      "adviser-os-news-intelligence";

    const opportunityCentre =
      document.getElementById(
        "adviser-os-opportunity-centre"
      );

    if (
      opportunityCentre &&
      opportunityCentre.parentNode
    ) {

      opportunityCentre.parentNode.insertBefore(
        centre,
        opportunityCentre
      );

    } else {

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
  }

  centre.innerHTML = "";

  centre.style.cssText = `
    width:calc(100% - 32px);
    max-width:1200px;
    margin:20px auto;
    box-sizing:border-box;
  `;

  const panel =
    document.createElement("div");

  panel.style.cssText = `
    background:#ffffff;
    border:1px solid #dfe5ec;
    border-radius:16px;
    padding:22px;
    box-shadow:0 6px 20px rgba(0,0,0,0.06);
  `;

  const header =
    document.createElement("div");

  header.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:16px;
    flex-wrap:wrap;
    margin-bottom:20px;
  `;

  const heading =
    document.createElement("div");

  heading.innerHTML = `
    <div style="
      font-size:12px;
      font-weight:bold;
      letter-spacing:1px;
      color:#667085;
      text-transform:uppercase;
      margin-bottom:5px;
    ">
      Market Intelligence
    </div>

    <div style="
      font-size:26px;
      font-weight:700;
      color:#172033;
    ">
      Current Industry News
    </div>

    <div style="
      font-size:14px;
      color:#667085;
      margin-top:5px;
      max-width:700px;
    ">
      Industry developments connected to your advisory
      work, products and client conversations.
    </div>
  `;

  header.appendChild(heading);

  const countBadge =
    document.createElement("div");

  countBadge.style.cssText = `
    background:#f4f7fb;
    border:1px solid #e1e7ef;
    border-radius:10px;
    padding:9px 13px;
    font-size:13px;
    font-weight:600;
    color:#344054;
  `;

  countBadge.textContent =
    `${AdviserOS.news.length} stories`;

  header.appendChild(countBadge);

  panel.appendChild(header);

  if (!AdviserOS.news.length) {

    const empty =
      document.createElement("div");

    empty.style.cssText = `
      padding:30px;
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
        News Intelligence is ready
      </div>

      <div style="line-height:1.5;">
        The news table is connected.
        Add industry stories to Supabase and
        they will appear here automatically.
      </div>
    `;

    panel.appendChild(empty);

  } else {

    const grid =
      document.createElement("div");

    grid.style.cssText = `
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:16px;
    `;

    AdviserOS.news.forEach(article => {

      const card =
        document.createElement("article");

      card.style.cssText = `
        border:1px solid #e1e7ef;
        border-radius:14px;
        overflow:hidden;
        background:#ffffff;
        display:flex;
        flex-direction:column;
        min-height:250px;
      `;

      const content =
        document.createElement("div");

      content.style.cssText = `
        padding:18px;
        display:flex;
        flex-direction:column;
        height:100%;
        box-sizing:border-box;
      `;

      const category =
        article.category || "Industry";

      const relevance =
        getNewsRelevanceLabel(
          article.relevance
        );

      const relevanceClass =
        getNewsRelevanceClass(
          article.relevance
        );

      const articleLink =
        article.url
          ? `
            <a
              href="${escapeHtml(article.url)}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:inline-block;
                margin-top:15px;
                color:#0b7a68;
                font-weight:700;
                text-decoration:none;
                font-size:13px;
              "
            >
              Read original article →
            </a>
          `
          : "";

      content.innerHTML = `

        <div style="
          display:flex;
          justify-content:space-between;
          gap:8px;
          align-items:flex-start;
          margin-bottom:10px;
        ">

          <span style="
            background:#f4f7fb;
            color:#344054;
            border-radius:7px;
            padding:5px 8px;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
          ">
            ${escapeHtml(category)}
          </span>

          <span style="
            background:${
              relevanceClass === "high"
                ? "#e8f5f1"
                : relevanceClass === "medium"
                  ? "#fff7e6"
                  : "#f4f7fb"
            };
            color:${
              relevanceClass === "high"
                ? "#08745f"
                : relevanceClass === "medium"
                  ? "#9a6700"
                  : "#667085"
            };
            border-radius:7px;
            padding:5px 8px;
            font-size:10px;
            font-weight:700;
          ">
            ${escapeHtml(relevance)}
          </span>

        </div>

        <h3 style="
          margin:0;
          font-size:18px;
          line-height:1.35;
          color:#172033;
        ">
          ${escapeHtml(
            article.headline ||
            "Untitled news story"
          )}
        </h3>

        <div style="
          margin-top:7px;
          font-size:12px;
          color:#667085;
        ">
          ${escapeHtml(
            article.source ||
            "Industry source"
          )}

          ·

          ${escapeHtml(
            formatNewsDate(
              article.published_at ||
              article.created_at
            )
          )}
        </div>

        ${
          article.summary
            ? `
              <div style="
                margin-top:12px;
                font-size:13px;
                line-height:1.55;
                color:#475467;
              ">
                ${escapeHtml(
                  article.summary
                )}
              </div>
            `
            : ""
        }

        ${
          article.why_it_matters
            ? `
              <div style="
                margin-top:14px;
                padding:12px;
                background:#f7f9fc;
                border-radius:10px;
                border-left:4px solid #c89b3c;
              ">
                <div style="
                  font-size:10px;
                  font-weight:700;
                  letter-spacing:.6px;
                  color:#667085;
                  text-transform:uppercase;
                  margin-bottom:5px;
                ">
                  Why it matters
                </div>

                <div style="
                  font-size:13px;
                  line-height:1.5;
                  color:#344054;
                ">
                  ${escapeHtml(
                    article.why_it_matters
                  )}
                </div>
              </div>
            `
            : ""
        }

        ${
          article.product_connection
            ? `
              <div style="
                margin-top:10px;
                padding:10px 12px;
                background:#eef8f5;
                border-radius:9px;
              ">
                <div style="
                  font-size:10px;
                  font-weight:700;
                  color:#08745f;
                  text-transform:uppercase;
                  letter-spacing:.5px;
                  margin-bottom:4px;
                ">
                  Product Connection
                </div>

                <div style="
                  font-size:13px;
                  line-height:1.45;
                  color:#245c51;
                ">
                  ${escapeHtml(
                    article.product_connection
                  )}
                </div>
              </div>
            `
            : ""
        }

        ${articleLink}

      `;

      card.appendChild(content);

      grid.appendChild(card);

    });

    panel.appendChild(grid);
  }

  centre.appendChild(panel);

  console.log(
    "News Intelligence rendered:",
    AdviserOS.news.length
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

    const newsCentre =
      document.getElementById(
        "adviser-os-news-intelligence"
      );

    const firstScreen =
      document.querySelector(".screen");

    if (
      newsCentre &&
      newsCentre.parentNode
    ) {

      newsCentre.parentNode.insertBefore(
        centre,
        newsCentre.nextSibling
      );

    } else if (firstScreen) {

      firstScreen.parentNode.insertBefore(
        centre,
        firstScreen
      );

    } else {

      document.body.prepend(centre);
    }
  }

  const opportunities =
    runOpportunityEngine();

  const summary =
    getOpportunitySummary();

  centre.innerHTML = "";

  centre.style.cssText = `
    width:calc(100% - 32px);
    max-width:1200px;
    margin:20px auto;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
  `;

  const panel =
    document.createElement("div");

  panel.style.cssText = `
    background:#ffffff;
    border:1px solid #dfe5ec;
    border-radius:16px;
    padding:22px;
    box-shadow:0 6px 20px rgba(0,0,0,0.06);
  `;

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

      createNewsIntelligence();

      createOpportunityCentre();

      createProspectingRadar();
    };

  header.appendChild(refreshButton);

  panel.appendChild(header);

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

  panel.appendChild(summaryGrid);

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

    panel.appendChild(empty);

  } else {

    const list =
      document.createElement("div");

    list.style.cssText = `
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:15px;
    `;

    opportunities.forEach(opportunity => {

      const card =
        document.createElement("div");

      const priority =
        String(
          opportunity.priority || ""
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

      opportunity.opportunities.forEach(item => {

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
      });

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

    });

    panel.appendChild(list);
  }

  centre.appendChild(panel);

  console.log(
    "Opportunity Centre rendered."
  );
}


// ============================================================
// RADAR HELPERS
// ============================================================

function getRadarConfidenceClass(confidence) {

  const value =
    String(confidence || "")
      .toLowerCase();

  if (value === "high") {

    return {
      background:"#e8f5f1",
      color:"#08745f",
      label:"HIGH CONFIDENCE"
    };
  }

  if (
    value === "medium" ||
    value === "moderate"
  ) {

    return {
      background:"#fff7e6",
      color:"#9a6700",
      label:"MODERATE CONFIDENCE"
    };
  }

  return {
    background:"#f4f7fb",
    color:"#667085",
    label:"EARLY SIGNAL"
  };
}


function formatRadarDate(dateValue) {

  if (!dateValue) {
    return "Date unavailable";
  }

  try {

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-ZA",
      {
        day:"numeric",
        month:"short",
        year:"numeric"
      }
    );

  } catch (error) {

    return "Date unavailable";
  }
}


// ============================================================
// RADAR INTELLIGENCE DETAIL
// ============================================================

function showRadarIntelligence(signalId) {

  const signal =
    AdviserOS.prospectingSignals.find(
      item =>
        item.id === signalId
    );

  if (!signal) return;

  let modal =
    document.getElementById(
      "adviser-os-radar-detail"
    );

  if (!modal) {

    modal =
      document.createElement("div");

    modal.id =
      "adviser-os-radar-detail";

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:9999;
      background:rgba(15,23,42,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      box-sizing:border-box;
    `;

    document.body.appendChild(modal);
  }

  const confidence =
    getRadarConfidenceClass(
      signal.confidence
    );

  modal.innerHTML = `

    <div style="
      width:min(850px,100%);
      max-height:90vh;
      overflow:auto;
      background:#ffffff;
      border-radius:18px;
      padding:24px;
      box-sizing:border-box;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        gap:15px;
        align-items:flex-start;
        margin-bottom:20px;
      ">

        <div>

          <div style="
            font-size:11px;
            font-weight:700;
            letter-spacing:1px;
            color:#667085;
            text-transform:uppercase;
            margin-bottom:6px;
          ">
            Prospecting Signal
          </div>

          <h2 style="
            margin:0;
            color:#172033;
            font-size:25px;
            line-height:1.3;
          ">
            ${escapeHtml(
              signal.title ||
              "Untitled signal"
            )}
          </h2>

          <div style="
            margin-top:7px;
            color:#667085;
            font-size:13px;
          ">
            ${escapeHtml(
              signal.location ||
              "Location unavailable"
            )}
            ·
            ${escapeHtml(
              signal.signal_type ||
              "Signal"
            )}
          </div>

        </div>

        <button
          onclick="closeRadarIntelligence()"
          style="
            border:0;
            background:#f4f7fb;
            color:#344054;
            border-radius:9px;
            padding:8px 11px;
            cursor:pointer;
            font-weight:700;
          "
        >
          ✕
        </button>

      </div>

      <div style="
        display:inline-block;
        background:${confidence.background};
        color:${confidence.color};
        padding:6px 9px;
        border-radius:7px;
        font-size:10px;
        font-weight:700;
        margin-bottom:20px;
      ">
        ${confidence.label}
      </div>

      <div style="
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(250px,1fr));
        gap:14px;
      ">

        ${radarDetailBox(
          "What happened",
          signal.evidence ||
          signal.summary ||
          "No documented evidence available.",
          "#f7f9fc",
          "#667085",
          "#344054"
        )}

        ${radarDetailBox(
          "AI interpretation",
          signal.inference ||
          "No interpretation recorded.",
          "#eef8f5",
          "#08745f",
          "#245c51"
        )}

        ${radarDetailBox(
          "When it may matter",
          signal.estimated_financial_window ||
          "Timing not established.",
          "#fffaf0",
          "#9a6700",
          "#684f18"
        )}

        ${radarDetailBox(
          "Who may be affected",
          signal.segment ||
          "Segment not specified.",
          "#f7f9fc",
          "#667085",
          "#344054"
        )}

        ${radarDetailBox(
          "Potential needs",
          signal.potential_needs ||
          "Needs not specified.",
          "#f7f9fc",
          "#667085",
          "#344054"
        )}

        ${radarDetailBox(
          "Product connection",
          signal.product_connection ||
          "Needs-based product matching.",
          "#eef8f5",
          "#08745f",
          "#245c51"
        )}

      </div>

      <div style="
        margin-top:16px;
        padding:16px;
        background:#172033;
        color:#ffffff;
        border-radius:12px;
      ">

        <div style="
          font-size:10px;
          font-weight:700;
          letter-spacing:.7px;
          text-transform:uppercase;
          opacity:.7;
          margin-bottom:6px;
        ">
          What to do
        </div>

        <div style="
          font-size:14px;
          line-height:1.55;
        ">
          ${escapeHtml(
            signal.action ||
            "Monitor the signal and establish client need before recommending a product."
          )}
        </div>

      </div>

      <div style="
        display:flex;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
        margin-top:17px;
        padding-top:14px;
        border-top:1px solid #eaecf0;
        font-size:12px;
        color:#667085;
      ">

        <div>
          Source:
          <strong>
            ${escapeHtml(
              signal.source ||
              "Not specified"
            )}
          </strong>
        </div>

        <div>
          Detected:
          ${escapeHtml(
            formatRadarDate(
              signal.detected_at
            )
          )}
        </div>

        ${
          signal.source_url
            ? `
              <a
                href="${escapeHtml(
                  signal.source_url
                )}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  color:#0b7a68;
                  font-weight:700;
                  text-decoration:none;
                "
              >
                Open source →
              </a>
            `
            : ""
        }

      </div>

    </div>
  `;

  modal.style.display =
    "flex";
}


function radarDetailBox(
  title,
  text,
  background,
  titleColor,
  textColor
) {

  return `

    <div style="
      padding:15px;
      background:${background};
      border-radius:12px;
    ">

      <div style="
        font-size:10px;
        font-weight:700;
        color:${titleColor};
        text-transform:uppercase;
        letter-spacing:.5px;
        margin-bottom:6px;
      ">
        ${escapeHtml(title)}
      </div>

      <div style="
        color:${textColor};
        font-size:14px;
        line-height:1.55;
      ">
        ${escapeHtml(text)}
      </div>

    </div>

  `;
}


function closeRadarIntelligence() {

  const modal =
    document.getElementById(
      "adviser-os-radar-detail"
    );

  if (modal) {
    modal.remove();
  }
}


// ============================================================
// CREATE LIVE PROSPECTING RADAR
// ============================================================

function createProspectingRadar() {

  const radar =
    document.getElementById("radar");

  if (!radar) {

    console.warn(
      "Adviser OS: Radar screen not found."
    );

    return;
  }

  let panel =
    document.getElementById(
      "adviser-os-live-radar"
    );

  if (!panel) {

    panel =
      document.createElement("div");

    panel.id =
      "adviser-os-live-radar";

    radar.prepend(panel);
  }

  panel.innerHTML = "";

  panel.style.cssText = `
    width:100%;
    box-sizing:border-box;
  `;

  const signals =
    AdviserOS.prospectingSignals || [];

  const territorySignals =
    AdviserOS.territorySignals || [];


  // ==========================================================
  // HEADER
  // ==========================================================

  const header =
    document.createElement("div");

  header.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:15px;
    flex-wrap:wrap;
    margin-bottom:18px;
  `;

  header.innerHTML = `

    <div>

      <div style="
        font-size:11px;
        font-weight:700;
        letter-spacing:1px;
        color:#667085;
        text-transform:uppercase;
      ">
        Live intelligence
      </div>

      <h2 style="
        margin:4px 0 0;
        color:#172033;
        font-size:25px;
      ">
        Prospecting Radar
      </h2>

      <div style="
        margin-top:5px;
        color:#667085;
        font-size:14px;
      ">
        Signal → Location → Segment → Timing → Need → Product → Action
      </div>

    </div>

    <button
      id="radar-refresh-button"
      style="
        border:0;
        border-radius:10px;
        padding:10px 14px;
        background:#172033;
        color:#ffffff;
        font-weight:700;
        cursor:pointer;
      "
    >
      Refresh Radar
    </button>
  `;

  panel.appendChild(header);

  const radarRefreshButton =
    document.getElementById(
      "radar-refresh-button"
    );

  if (radarRefreshButton) {

    radarRefreshButton.onclick =
      async function () {

        this.textContent =
          "Refreshing...";

        await refreshAdviserOSData();

        createProspectingRadar();
      };
  }


  // ==========================================================
  // FLOW
  // ==========================================================

  const flow =
    document.createElement("div");

  flow.style.cssText = `
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(115px,1fr));
    gap:7px;
    margin-bottom:18px;
  `;

  [
    "SIGNAL",
    "LOCATION",
    "SEGMENT",
    "TIMING",
    "NEED",
    "PRODUCT",
    "ACTION"
  ].forEach(
    (item, index) => {

      const box =
        document.createElement("div");

      box.style.cssText = `
        padding:9px 7px;
        text-align:center;
        border-radius:8px;
        background:${index === 0 ? "#172033" : "#f4f7fb"};
        color:${index === 0 ? "#ffffff" : "#475467"};
        font-size:10px;
        font-weight:700;
        letter-spacing:.5px;
      `;

      box.textContent =
        item;

      flow.appendChild(box);
    }
  );

  panel.appendChild(flow);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    document.createElement("div");

  summary.style.cssText = `
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(150px,1fr));
    gap:12px;
    margin-bottom:20px;
  `;

  const localSignals =
    signals.filter(signal => {

      const location =
        String(
          signal.location || ""
        ).toLowerCase();

      return (
        location.includes("mmabatho") ||
        location.includes("mahikeng")
      );
    });

  const summaryItems = [

    {
      label:"Live signals",
      value:signals.length
    },

    {
      label:"Local signals",
      value:localSignals.length
    },

    {
      label:"Territory signals",
      value:territorySignals.length
    },

    {
      label:"High confidence",
      value:signals.filter(
        signal =>
          String(
            signal.confidence || ""
          ).toLowerCase() === "high"
      ).length
    }

  ];

  summaryItems.forEach(item => {

    const card =
      document.createElement("div");

    card.style.cssText = `
      background:#ffffff;
      border:1px solid #e1e7ef;
      border-radius:12px;
      padding:15px;
    `;

    card.innerHTML = `

      <div style="
        font-size:11px;
        color:#667085;
        margin-bottom:5px;
      ">
        ${escapeHtml(item.label)}
      </div>

      <div style="
        font-size:25px;
        font-weight:700;
        color:#172033;
      ">
        ${item.value}
      </div>

    `;

    summary.appendChild(card);

  });

  panel.appendChild(summary);


  // ==========================================================
  // TODAY'S SIGNALS
  // ==========================================================

  const signalsHeading =
    document.createElement("div");

  signalsHeading.innerHTML = `

    <h3 style="
      margin:0 0 10px;
      color:#172033;
      font-size:20px;
    ">
      Today's Signals
    </h3>

  `;

  panel.appendChild(signalsHeading);

  if (!signals.length) {

    const empty =
      document.createElement("div");

    empty.style.cssText = `
      padding:25px;
      border:1px dashed #cbd5e1;
      border-radius:12px;
      text-align:center;
      color:#667085;
      background:#fafbfc;
    `;

    empty.textContent =
      "No active prospecting signals are currently available.";

    panel.appendChild(empty);

  } else {

    const grid =
      document.createElement("div");

    grid.style.cssText = `
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:15px;
    `;

    signals.forEach(signal => {

      const confidence =
        getRadarConfidenceClass(
          signal.confidence
        );

      const card =
        document.createElement("article");

      card.style.cssText = `
        background:#ffffff;
        border:1px solid #e1e7ef;
        border-radius:14px;
        padding:17px;
        box-sizing:border-box;
      `;

      card.innerHTML = `

        <div style="
          display:flex;
          justify-content:space-between;
          gap:8px;
          align-items:flex-start;
        ">

          <span style="
            background:#f4f7fb;
            color:#344054;
            border-radius:7px;
            padding:5px 8px;
            font-size:10px;
            font-weight:700;
            text-transform:uppercase;
          ">
            ${escapeHtml(
              signal.signal_type ||
              "Signal"
            )}
          </span>

          <span style="
            background:${confidence.background};
            color:${confidence.color};
            border-radius:7px;
            padding:5px 8px;
            font-size:9px;
            font-weight:700;
          ">
            ${confidence.label}
          </span>

        </div>

        <h4 style="
          margin:13px 0 5px;
          font-size:17px;
          line-height:1.35;
          color:#172033;
        ">
          ${escapeHtml(
            signal.title ||
            "Untitled signal"
          )}
        </h4>

        <div style="
          font-size:12px;
          color:#667085;
        ">
          📍
          ${escapeHtml(
            signal.location ||
            "Location unavailable"
          )}
        </div>

        <div style="
          margin-top:12px;
          font-size:13px;
          line-height:1.5;
          color:#475467;
        ">
          ${escapeHtml(
            signal.summary ||
            signal.evidence ||
            "No summary available."
          )}
        </div>

        <div style="
          margin-top:12px;
          padding:10px;
          background:#f7f9fc;
          border-radius:9px;
        ">

          <div style="
            font-size:9px;
            font-weight:700;
            color:#667085;
            text-transform:uppercase;
            margin-bottom:4px;
          ">
            Timing
          </div>

          <div style="
            font-size:12px;
            color:#344054;
            line-height:1.45;
          ">
            ${escapeHtml(
              signal.estimated_financial_window ||
              "Timing developing"
            )}
          </div>

        </div>

        <div style="
          margin-top:10px;
          font-size:12px;
          color:#475467;
        ">
          <strong>Potential needs:</strong>
          ${escapeHtml(
            signal.potential_needs ||
            "Needs assessment required."
          )}
        </div>

        <button
          data-radar-signal-id="${escapeHtml(
            signal.id
          )}"
          style="
            margin-top:13px;
            width:100%;
            border:0;
            border-radius:9px;
            padding:10px;
            background:#0b7a68;
            color:#ffffff;
            font-weight:700;
            cursor:pointer;
          "
        >
          View Intelligence →
        </button>

      `;

      const button =
        card.querySelector(
          "[data-radar-signal-id]"
        );

      if (button) {

        button.onclick =
          function () {

            showRadarIntelligence(
              signal.id
            );

          };
      }

      grid.appendChild(card);

    });

    panel.appendChild(grid);
  }


  // ==========================================================
  // TERRITORY PULSE
  // ==========================================================

  const territoryTitle =
    document.createElement("div");

  territoryTitle.style.cssText = `
    margin-top:25px;
    margin-bottom:10px;
  `;

  territoryTitle.innerHTML = `

    <h3 style="
      margin:0;
      color:#172033;
      font-size:20px;
    ">
      Territory Pulse
    </h3>

    <div style="
      margin-top:4px;
      font-size:13px;
      color:#667085;
    ">
      Live signals affecting the wider territory.
    </div>

  `;

  panel.appendChild(territoryTitle);

  if (!territorySignals.length) {

    const empty =
      document.createElement("div");

    empty.style.cssText = `
      padding:20px;
      border:1px dashed #cbd5e1;
      border-radius:12px;
      color:#667085;
    `;

    empty.textContent =
      "No active territory signals available.";

    panel.appendChild(empty);

  } else {

    const territoryGrid =
      document.createElement("div");

    territoryGrid.style.cssText = `
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:15px;
    `;

    territorySignals.forEach(signal => {

      const confidence =
        getRadarConfidenceClass(
          signal.confidence
        );

      const card =
        document.createElement("div");

      card.style.cssText = `
        background:#ffffff;
        border:1px solid #e1e7ef;
        border-radius:14px;
        padding:17px;
      `;

      card.innerHTML = `

        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">

          <div style="
            font-size:11px;
            font-weight:700;
            color:#667085;
            text-transform:uppercase;
          ">
            ${escapeHtml(
              signal.industry ||
              "Territory"
            )}
          </div>

          <span style="
            background:${confidence.background};
            color:${confidence.color};
            padding:5px 8px;
            border-radius:7px;
            font-size:9px;
            font-weight:700;
          ">
            ${confidence.label}
          </span>

        </div>

        <div style="
          margin-top:9px;
          font-size:17px;
          font-weight:700;
          color:#172033;
        ">
          ${escapeHtml(
            signal.title ||
            "Territory signal"
          )}
        </div>

        <div style="
          margin-top:5px;
          font-size:12px;
          color:#667085;
        ">
          📍
          ${escapeHtml(
            signal.territory ||
            "Territory unavailable"
          )}
        </div>

        <div style="
          margin-top:12px;
          font-size:13px;
          line-height:1.5;
          color:#475467;
        ">
          ${escapeHtml(
            signal.summary ||
            "No summary available."
          )}
        </div>

        <div style="
          margin-top:12px;
          padding:10px;
          background:#f7f9fc;
          border-radius:9px;
        ">

          <div style="
            font-size:9px;
            font-weight:700;
            color:#667085;
            text-transform:uppercase;
            margin-bottom:4px;
          ">
            Timing
          </div>

          <div style="
            font-size:12px;
            line-height:1.45;
            color:#344054;
          ">
            ${escapeHtml(
              signal.timing ||
              "Timing developing"
            )}
          </div>

        </div>

        ${
          signal.affected_segment
            ? `
              <div style="
                margin-top:10px;
                font-size:12px;
                color:#475467;
              ">
                <strong>Affected segment:</strong>
                ${escapeHtml(
                  signal.affected_segment
                )}
              </div>
            `
            : ""
        }

        ${
          signal.potential_needs
            ? `
              <div style="
                margin-top:8px;
                font-size:12px;
                color:#475467;
              ">
                <strong>Potential needs:</strong>
                ${escapeHtml(
                  signal.potential_needs
                )}
              </div>
            `
            : ""
        }

      `;

      territoryGrid.appendChild(card);

    });

    panel.appendChild(territoryGrid);
  }


  // ==========================================================
  // LOCAL CLUSTER DETECTION
  // ==========================================================

  if (localSignals.length >= 2) {

    const cluster =
      document.createElement("div");

    cluster.style.cssText = `
      margin-top:18px;
      padding:17px;
      border-radius:13px;
      background:#fffaf0;
      border:1px solid #f0dfb1;
    `;

    cluster.innerHTML = `

      <div style="
        font-size:11px;
        font-weight:700;
        letter-spacing:.7px;
        color:#9a6700;
        text-transform:uppercase;
      ">
        Local Cluster Detected
      </div>

      <div style="
        margin-top:5px;
        font-size:17px;
        font-weight:700;
        color:#684f18;
      ">
        Mmabatho / Mahikeng
      </div>

      <div style="
        margin-top:5px;
        font-size:13px;
        line-height:1.5;
        color:#684f18;
      ">
        Multiple local signals are currently connected
        to the same territory. This is a territory-level
        intelligence signal and does not identify specific
        individuals or confirm future appointments.
      </div>

    `;

    panel.appendChild(cluster);
  }


  // ==========================================================
  // TIMING ENGINE
  // ==========================================================

  const timing =
    document.createElement("div");

  timing.style.cssText = `
    margin-top:18px;
    padding:17px;
    background:#f7f9fc;
    border:1px solid #e1e7ef;
    border-radius:13px;
  `;

  timing.innerHTML = `

    <div style="
      font-size:11px;
      font-weight:700;
      color:#667085;
      letter-spacing:.7px;
      text-transform:uppercase;
    ">
      Timing Engine
    </div>

    <div style="
      margin-top:8px;
      display:flex;
      flex-wrap:wrap;
      gap:7px;
    ">

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        1. Detected
      </span>

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        2. Developing
      </span>

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        3. Event
      </span>

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        4. Financial transition
      </span>

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        5. Follow-up
      </span>

      <span style="
        padding:7px 10px;
        background:#ffffff;
        border:1px solid #dfe5ec;
        border-radius:8px;
        font-size:11px;
        font-weight:700;
        color:#475467;
      ">
        6. Monitor
      </span>

    </div>

    <div style="
      margin-top:10px;
      font-size:12px;
      line-height:1.5;
      color:#667085;
    ">
      Timing is a planning model. It does not establish that
      a particular person has been appointed, paid, or is
      ready to purchase a financial product.
    </div>

  `;

  panel.appendChild(timing);


  // ==========================================================
  // SIGNAL DEFINITIONS
  // ==========================================================

  const definitions =
    document.createElement("div");

  definitions.style.cssText = `
    margin-top:18px;
    padding:15px;
    border-top:1px solid #eaecf0;
    color:#667085;
    font-size:12px;
    line-height:1.55;
  `;

  definitions.innerHTML = `

    <strong style="color:#344054;">
      Radar confidence:
    </strong>

    High = recent signal supported by strong evidence.

    Moderate = useful signal with some uncertainty.

    Early = interesting signal requiring further evidence.

    <br><br>

    Radar intelligence is based on territory and segment
    signals. It should be combined with actual client
    discovery and verified information before any
    recommendation is made.

  `;

  panel.appendChild(definitions);

  console.log(
    "Live Prospecting Radar rendered:",
    signals.length,
    "signals and",
    territorySignals.length,
    "territory signals."
  );
}


// ============================================================
// HTML SAFETY HELPER
// ============================================================

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// SCREEN NAVIGATION
// ============================================================

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
    top:0,
    behavior:"smooth"
  });
}


function newProspect() {

  navigateTo("prospects");
}


function clientDiscovery() {

  navigateTo("client-workspace");
}


function productIntelligence() {

  navigateTo("product-intelligence");
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

  await loadNews();

  await loadProspectingSignals();

  await loadTerritorySignals();

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

  setTimeout(
    function () {

      createNewsIntelligence();

      createOpportunityCentre();

      createProspectingRadar();

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

    createNewsIntelligence();

    createOpportunityCentre();

    createProspectingRadar();

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

window.loadNews =
  loadNews;

window.createNewsIntelligence =
  createNewsIntelligence;

window.loadProspectingSignals =
  loadProspectingSignals;

window.loadTerritorySignals =
  loadTerritorySignals;

window.createProspectingRadar =
  createProspectingRadar;

window.showRadarIntelligence =
  showRadarIntelligence;

window.closeRadarIntelligence =
  closeRadarIntelligence;


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
